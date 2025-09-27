/*
 * Thread-safe in-memory persistence for Blueprints.
 */
package edu.eci.arsw.blueprints.persistence.impl;

import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.model.Point;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;
import java.util.Map;
import java.util.Set;
import java.util.HashSet;
import java.util.List;
import java.util.concurrent.ConcurrentHashMap;
import org.springframework.stereotype.Repository;

@Repository
public class InMemoryBlueprintPersistence implements BlueprintsPersistence {

    private final Map<Tuple<String,String>, Blueprint> blueprints = new ConcurrentHashMap<>();

    public InMemoryBlueprintPersistence() {
        Point[] pts = new Point[]{new Point(140, 140), new Point(115, 115)};
        Blueprint bp = new Blueprint("_authorname_", "_bpname_ ", pts);
        blueprints.put(new Tuple<>(bp.getAuthor(), bp.getName()), bp);

        Point[] pts2 = new Point[]{new Point(0, 0), new Point(10, 10), new Point(20, 20)};
        Blueprint bp2 = new Blueprint("Andres", "garden", pts2);
        blueprints.put(new Tuple<>(bp2.getAuthor(), bp2.getName()), bp2);

        Point[] pts3 = new Point[]{new Point(5, 5), new Point(15, 15)};
        Blueprint bp3 = new Blueprint("Juan", "house", pts3);
        blueprints.put(new Tuple<>(bp3.getAuthor(), bp3.getName()), bp3);

        Point[] pts4 = new Point[]{new Point(0, 0), new Point(5, 5), new Point(10, 10)};
        Blueprint bp4 = new Blueprint("Juan", "office", pts4);
        blueprints.put(new Tuple<>(bp4.getAuthor(), bp4.getName()), bp4);
    }


    @Override
    public void saveBlueprint(Blueprint bp) throws BlueprintPersistenceException {
        Tuple<String,String> key = new Tuple<>(bp.getAuthor(), bp.getName());
        Blueprint prev = blueprints.putIfAbsent(key, copyOf(bp));
        if (prev != null) {
            throw new BlueprintPersistenceException("The given blueprint already exists: " + bp);
        }
    }

    @Override
    public Blueprint getBlueprint(String author, String bprintname) throws BlueprintNotFoundException {
        Blueprint bp = blueprints.get(new Tuple<>(author, bprintname));
        if (bp == null) throw new BlueprintNotFoundException("Blueprint not found: " + author + "/" + bprintname);
        return copyOf(bp);
    }

    @Override
    public Set<Blueprint> getBlueprintsByAuthor(String author) {
        Set<Blueprint> result = new HashSet<>();
        for (Blueprint bp : blueprints.values()) {
            if (bp.getAuthor().equals(author)) {
                result.add(copyOf(bp));
            }
        }
        return result;
    }

    @Override
    public Set<Blueprint> getAllBlueprints() {
        Set<Blueprint> out = new HashSet<>();
        for (Blueprint bp : blueprints.values()) {
            out.add(copyOf(bp));
        }
        return out;
    }

    @Override
    public void updateBlueprint(String author, String name, Blueprint updated) throws BlueprintNotFoundException {
        Tuple<String,String> key = new Tuple<>(author, name);
        Blueprint replaced = blueprints.computeIfPresent(key, (k, v) -> copyOf(updated));
        if (replaced == null) {
            throw new BlueprintNotFoundException("Blueprint not found: " + author + "/" + name);
        }
    }


    /** Deep copy of a Blueprint to avoid exposing internal mutable state */
    private Blueprint copyOf(Blueprint src) {
        List<Point> pts = src.getPoints();
        Point[] arr = new Point[pts.size()];
        for (int i = 0; i < pts.size(); i++) {
            Point p = pts.get(i);
            arr[i] = new Point(p.getX(), p.getY());
        }
        return new Blueprint(src.getAuthor(), src.getName(), arr);
    }
}