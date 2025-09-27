package edu.eci.arsw.blueprints.filters;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import java.util.ArrayList;
import java.util.List;
import org.springframework.stereotype.Component;

@Component("subsampling")
public class SubsamplingFilter implements BlueprintFilter {

    @Override
    public Blueprint apply(Blueprint bp) {
        List<Point> pts = bp.getPoints();
        if (pts == null || pts.size() <= 1) return bp;

        List<Point> out = new ArrayList<>();
        for (int i = 0; i < pts.size(); i += 2) {
            out.add(pts.get(i)); // conserva 0,2,4,...
        }
        Point[] arr = out.toArray(new Point[0]);
        return new Blueprint(bp.getAuthor(), bp.getName(), arr);
    }
}
