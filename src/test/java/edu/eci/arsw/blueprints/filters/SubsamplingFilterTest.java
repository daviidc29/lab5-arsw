package edu.eci.arsw.blueprints.filters;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;


import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;

class SubsamplingFilterTest {

    @Test
     void keepsEveryOtherPoint() {
        // 0,1,2,3,4,5 -> 0,2,4
        Blueprint in = new Blueprint("t","even",
            new Point[]{ new Point(0,0), new Point(1,1), new Point(2,2),
                         new Point(3,3), new Point(4,4), new Point(5,5) });

        Blueprint out = new SubsamplingFilter().apply(in);

        assertEquals(3, out.getPoints().size());
        assertEquals(0, out.getPoints().get(0).getX()); assertEquals(0, out.getPoints().get(0).getY());
        assertEquals(2, out.getPoints().get(1).getX()); assertEquals(2, out.getPoints().get(1).getY());
        assertEquals(4, out.getPoints().get(2).getX()); assertEquals(4, out.getPoints().get(2).getY());
    }

    @Test
    void withDuplicatesStillSubsamples() {
        Point a = new Point(0,0);
        Point b = new Point(1,1);
        // a,a,a,b,b,c -> toma índices 0,2,4 = a,a,b
        Blueprint in = new Blueprint("t","dups",
            new Point[]{ a,a,a,b,b,new Point(2,2) });

        Blueprint out = new SubsamplingFilter().apply(in);

        assertEquals(3, out.getPoints().size());
        assertEquals(0, out.getPoints().get(0).getX()); assertEquals(0, out.getPoints().get(0).getY()); // a
        assertEquals(0, out.getPoints().get(1).getX()); assertEquals(0, out.getPoints().get(1).getY()); // a 
        assertEquals(1, out.getPoints().get(2).getX()); assertEquals(1, out.getPoints().get(2).getY()); // b
    }
}
