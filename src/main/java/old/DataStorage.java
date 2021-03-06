package old;

import java.util.concurrent.ExecutorService;
import java.util.concurrent.Executors;

import old_datatypes.*;

import java.util.LinkedList;
import java.util.prefs.BackingStoreException;
import java.util.prefs.Preferences;
import javax.swing.ImageIcon;
import javax.swing.JTextField;

/**
 * Singleton class to keep the data somewhere
 * 
 * @author Claas Anders "CaScAdE" Rathje
 */
public class DataStorage {

    volatile public static int requestOSDtime;
    volatile public static int requestDEBUGtime;
    //public static ThreadGroup threadGroup = new ThreadGroup("MyGroup");
    //public static ExecutorService executors = Executors.newSingleThreadExecutor();
    public static ExecutorService executors = Executors.newCachedThreadPool();

    public static enum UART_CONNECTION {

        FC, MK3MAG, MKGPS, NC
    }
    public static ImageIcon iconHome;
    public static ImageIcon iconCurrent;
    public static ImageIcon iconTarget;
    public static ImageIcon mainLogo;
    public static NaviData_t naviData = new NaviData_t();
    public static str_VersionInfo NCversion = new str_VersionInfo("NC");
    public static str_VersionInfo FCversion = new str_VersionInfo("FC");
    public static str_VersionInfo MK3version = new str_VersionInfo("MK3Mag");
    public static str_DebugOut FCDebugOut = new str_DebugOut("FC", CommunicationBase.FC_ADDRESS);
    public static str_DebugOut NCDebugOut = new str_DebugOut("NC", CommunicationBase.NC_ADDRESS);
    public static str_DebugOut MK3MAGDebugOut = new str_DebugOut("MK3MAG", CommunicationBase.MK3MAG_ADDRESS);
    public static paramset_t paramset[] = new paramset_t[5];
    public static int activeParamset = 3;
    public static Waypoint_t waypointList[] = new Waypoint_t[100];
    public static PPMArray ppmarray = new PPMArray();
    public static MixerTable_t mixerset = new MixerTable_t();
    public static Data3D_t data3d_t = new Data3D_t();
    public static BLData_t bldata_t[] = new BLData_t[12];
    public static Preferences preferences;
    public static Encode encoder;
    public static CommunicationBase serial;
    private static DataStorage instance = new DataStorage();
    private static LinkedList<c_int> serializePool;
    public volatile static UART_CONNECTION UART = UART_CONNECTION.NC;
    public static final String nodeName = "NC Simulator";
    public static int motorCounter = 0;

    private DataStorage() {
        serializePool = new LinkedList<c_int>();
        preferences = Preferences.userRoot().node(nodeName);


        if (paramset == null || paramset[0] == null) {
            paramset = new paramset_t[5];
            for (int i = 0; i < paramset.length; i++) {
                paramset[i] = new paramset_t(i + 1);
            }
        }
        if (bldata_t == null || bldata_t[0] == null) {
            bldata_t = new BLData_t[12];
            for (int i = 0; i < bldata_t.length; i++) {
                bldata_t[i] = new BLData_t(i);
            }
        }


        if (waypointList == null || waypointList[0] == null) {
            waypointList = new Waypoint_t[100];
            for (int i = 0; i < waypointList.length; i++) {
                waypointList[i] = getEmptyWP(i + 1);
            }
        }

    }

    public static void clearWP() {
        /*
         * why clear bldata in clearWP???
        for (int i = 0; i < bldata_t.length; i++) {
            bldata_t[i] = new BLData_t(i);
        }
         * 
         */
    }

    public static Waypoint_t getEmptyWP(int index) {
        Waypoint_t wp = new Waypoint_t("WP" + index);
        wp.Position.Status.value = Waypoint_t.INVALID;
        wp.Position.Latitude.value = 0;
        wp.Position.Longitude.value = 0;
        wp.Position.Altitude.value = 0;
        wp.Heading.value = 361; 		// invalid value
        wp.ToleranceRadius.value = 0;	// in meters, if the MK is within that range around the target, then the next target is triggered
        wp.HoldTime.value = 0;			// in seconds, if the was once in the tolerance area around a WP, this time defines the delay before the next WP is triggered
        wp.Type.value = Waypoint_t.POINT_TYPE_INVALID;
        wp.Event_Flag.value = 0;		// future implementation
        wp.AltitudeRate.value = 0;		// no change of setpoint
        wp.Speed.value = 30;		// no change of setpoint
        wp.CameraAngle.value = 0;		// no change of setpoint
        wp.Index.value = index + 1;
        return wp;
    }

    public static void addWP(Waypoint_t wp) {

        int wpIndex = (int) wp.Index.value - 1;

        System.out.println("Add WP " + wp.Index.value);
        wp.printOut();

        waypointList[wpIndex] = wp;
    }

    public static synchronized DataStorage getInstance() {
        if (instance == null) {
            instance = new DataStorage();
        }
        return instance;
    }

    public static void setUART(UART_CONNECTION u) {
        UART = u;
        //DataStorage.statusBar.uartMode.setText(u.name());
    }

    public static void addToSerializePool(c_int re) {
        getInstance();
        //System.out.println("added: " + re + "  ::: " + re.getSerializeName() + "\t\t" + serializePool);
        if (re.allAttribs == null) {
            serializePool.add(re);
            re.setValue(preferences.getLong(re.getSerializeName(), re.value), false);
        } else {
            for (c_int c : re.allAttribs) {
                if (re.allAttribs != null || c.getSerializeName() == null) {
                    addToSerializePool(c);
                    //System.err.println("NULL: " + c);
                } else {
                    serializePool.add(c);
                    c.setValue(preferences.getLong(c.getSerializeName(), c.value), false);
                }
            }
        }
    }

    public static void serializePool() {
        for (c_int c : serializePool) {
            preferences.putLong(c.getSerializeName(), c.value);
            if (c instanceof s16Debug) {
                s16Debug s = ((s16Debug) c);
                preferences.put(s.getSerializeName() + "LABEL", ((JTextField) s.nameLabel).getText());
                //System.out.println("save: " + s.getSerializeName() + "LABEL" + "\t value:" + s.name);
            }

        }
    }

    public static void loadPool() {

        for (c_int c : serializePool) {
            c.setValue(preferences.getLong(c.getSerializeName(), c.value), false);
            //System.out.println(c.getSerializeName());
            if (c instanceof s16Debug) {
                s16Debug s = ((s16Debug) c);
                s.setName(preferences.get(s.getSerializeName() + "LABEL", ((JTextField) s.nameLabel).getText()));

                //System.out.println("load: " + s.getSerializeName() + "LABEL" + "\t value:" + s.name);
            }

        }
    }

    public static void deltePool() {
        try {
            preferences.removeNode();
            preferences = Preferences.userRoot().node(nodeName);
            System.out.println("deleted");
        } catch (BackingStoreException ex) {
            System.err.println("delete fail");
        }

    }
}