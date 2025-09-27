package edu.eci.arsw.blueprints.filters;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;


import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;

class RedundancyFilterTest {

    @Test
    void removesOnlyConsecutiveDuplicates() {
        Point a = new Point(0,0);
        Point b = new Point(1,1);
        Point c = new Point(2,2);
        // a,a,a,b,b,c  ->  a,b,c
        Blueprint in = new Blueprint("t","dups", new Point[]{ a,a,a,b,b,c });

        Blueprint out = new RedundancyFilter().apply(in);

        assertEquals(3, out.getPoints().size());
        assertEquals(0, out.getPoints().get(0).getX()); assertEquals(0, out.getPoints().get(0).getY());
        assertEquals(1, out.getPoints().get(1).getX()); assertEquals(1, out.getPoints().get(1).getY());
        assertEquals(2, out.getPoints().get(2).getX()); assertEquals(2, out.getPoints().get(2).getY());
    }

    @Test
    void keepsAllIfNoConsecutiveDuplicates() {
        Blueprint in = new Blueprint("t","long",
            new Point[]{ new Point(0,0), new Point(1,1), new Point(2,2), new Point(3,3) });

        Blueprint out = new RedundancyFilter().apply(in);

        assertEquals(4, out.getPoints().size());
    }
}
