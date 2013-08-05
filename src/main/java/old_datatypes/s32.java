package old_datatypes;

/**
 * 32bit signed int
 *
 * @author Claas Anders "CaScAdE" Rathje
 */
public class s32 extends c_int {

    public s32(String name) {
        signed = true;
        length = 32;
        this.name = name;
    }
}
