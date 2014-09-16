package j1.nashorn;

import java.io.FileReader;
import javax.script.ScriptEngine;
import javax.script.ScriptEngineManager;

public class Main {

    public static void main(String[] args) throws Exception {
        final ScriptEngineManager sem = new ScriptEngineManager();
        final ScriptEngine nashorn = sem.getEngineByName("nashorn");

//        nashorn.eval(new FileReader("src/main/resources/bigdecimal.js"));
//        nashorn.eval(new FileReader("src/main/resources/stream.js"));
        nashorn.eval(new FileReader("src/main/resources/stream_from_file.js"));
    }
}
