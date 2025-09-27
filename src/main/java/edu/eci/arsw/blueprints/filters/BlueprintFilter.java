package edu.eci.arsw.blueprints.filters;
import edu.eci.arsw.blueprints.model.Blueprint;

public interface BlueprintFilter {
    Blueprint apply(Blueprint bp);
    default String name() { 
        return getClass().getSimpleName(); 
    }
}
