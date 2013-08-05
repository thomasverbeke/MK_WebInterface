package old_datatypes;


import javax.swing.JTextField;

/**
 * 16bit signed debug-int with label
 *
 * @author Claas Anders "CaScAdE" Rathje
 */
public class s16Debug extends s16 {

    int index = 0;
    String prefix;
    public int ADDRESS;

    public s16Debug(String name, int index, int address) {
        signed = true;
        length = 16;
        this.name = name;
        this.prefix = name;
        this.index = index;
        this.ADDRESS = address;
    }

    @Override
    public String getSerializeName() {
        return prefix + "" + index;
    }

    public int[] getLabelArray() {
        int[] ret = new int[16];
        String s = ((JTextField) nameLabel).getText();
        if (s.length() > 16) {
            s = s.substring(0, 16);
        }

        int i = 0;
        for (char c : s.toCharArray()) {
            ret[i++] = (int) c;
        }
        for (; i < ret.length; i++) {
            ret[i] = (int) ' ';
        }
        //ret[15] = 0;

        return c_int.concatArray(new int[]{index}, ret);
    }


    public void setName(String get) {
        this.name = get;
        ((JTextField) getNameLabel()).setText(get);
    }
}

