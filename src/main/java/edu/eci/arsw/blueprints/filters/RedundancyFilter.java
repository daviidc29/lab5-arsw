package edu.eci.arsw.blueprints.filters;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import java.util.ArrayList;
import java.util.List;
import org.springframework.context.annotation.Primary;
import org.springframework.stereotype.Component;

@Component
@Primary // filtro por defecto
public class RedundancyFilter implements BlueprintFilter {

    @Override
    public Blueprint apply(Blueprint bp) {
        List<Point> pts = bp.getPoints();
        if (pts == null || pts.isEmpty()) return bp;

        List<Point> out = new ArrayList<>();
        Point last = null;
        for (Point p : pts) {
            if (last == null || !last.equals(p)) {
                out.add(p);
            }
            last = p;
        }
        Point[] arr = out.toArray(new Point[0]);
        return new Blueprint(bp.getAuthor(), bp.getName(), arr);
    }
}
