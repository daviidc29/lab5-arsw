package edu.eci.arsw.blueprints.test.persistence.impl;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.impl.InMemoryBlueprintPersistence;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

class InMemoryPersistenceTest {
    

    @Test
    void saveExistingBpTest() {
        InMemoryBlueprintPersistence ibpp = new InMemoryBlueprintPersistence();
        
        Point[] pts = new Point[] { new Point(0, 0), new Point(10, 10) };
        Blueprint bp = new Blueprint("john", "thepaint", pts);
        
        try {
            ibpp.saveBlueprint(bp);
        } catch (BlueprintPersistenceException ex) {
            fail("Blueprint persistence failed inserting the first blueprint.");
        }
        
        Point[] pts2 = new Point[] { new Point(10, 10), new Point(20, 20) };
        Blueprint bp2 = new Blueprint("john", "thepaint", pts2);

        try {
            ibpp.saveBlueprint(bp2);
            fail("An exception was expected after saving a second blueprint with the same name and author");
        } catch (BlueprintPersistenceException ex) {
            // Correcto: se esperaba excepción
        }
    }

    @Test
    void getAllBlueprintsShouldReturnUnion() throws Exception {
        InMemoryBlueprintPersistence ibpp = new InMemoryBlueprintPersistence();
        int initial = ibpp.getAllBlueprints().size();
        Blueprint a = new Blueprint("a", "a1", new Point[] { new Point(0, 0) });
        Blueprint b = new Blueprint("b", "b1", new Point[] { new Point(1, 1) });
        Blueprint c = new Blueprint("b", "b2", new Point[] { new Point(2, 2) });
        ibpp.saveBlueprint(a);
        ibpp.saveBlueprint(b);
        ibpp.saveBlueprint(c);
        assertEquals(initial + 3, ibpp.getAllBlueprints().size());
    }
}
