package old_datatypes;

/**
 * 16bit unsigned int
 *
 * @author Claas Anders "CaScAdE" Rathje
 */
public class u16 extends c_int {

    public u16(String name) {
        signed = false;
        length = 16;
        this.name = name;
    }
    public u16(String name,int maxValue) {
        signed = false;
        length = 16;
        this.name = name;
        this.maxValue=new Integer(maxValue);
    }
}
