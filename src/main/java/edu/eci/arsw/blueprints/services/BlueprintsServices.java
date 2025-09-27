/*
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
package edu.eci.arsw.blueprints.services;

import edu.eci.arsw.blueprints.filters.BlueprintFilter;
import edu.eci.arsw.blueprints.model.Blueprint;
import edu.eci.arsw.blueprints.persistence.BlueprintNotFoundException;
import edu.eci.arsw.blueprints.persistence.BlueprintPersistenceException;
import edu.eci.arsw.blueprints.persistence.BlueprintsPersistence;

import java.util.HashSet;
import java.util.Set;
import org.springframework.stereotype.Service;

/**
 *
 * @author hcadavid
 */
@Service
public class BlueprintsServices {
   
    BlueprintsPersistence persistence;
    private final BlueprintFilter filter;


    // Inyección por constructor 
    public BlueprintsServices(BlueprintsPersistence persistence, BlueprintFilter filter) {
        this.persistence = persistence;
        this.filter = filter;
    }
    
    /** Registrar un nuevo plano. */
    public void addNewBlueprint(Blueprint bp){
        try {
            persistence.saveBlueprint(bp);
        } catch (BlueprintPersistenceException e) {
            throw new RuntimeException("Error saving blueprint"+bp,e);
        }
    }
    
    /** Consultar todos los planos. */
    public Set<Blueprint> getAllBlueprints() {
        Set<Blueprint> out = new HashSet<>();
        for (Blueprint bp : persistence.getAllBlueprints()) {
            out.add(filter.apply(bp));
        }
        return out;
    }
    
    /**
     * 
     * @param author blueprint's author
     * @param name blueprint's name
     * @return the blueprint of the given name created by the given author
     * @throws BlueprintNotFoundException if there is no such blueprint
     */
    public Blueprint getBlueprint(String author, String name) throws BlueprintNotFoundException {
        Blueprint bp = persistence.getBlueprint(author, name);
        if (bp == null) throw new BlueprintNotFoundException("Blueprint not found: " + author + ":" + name);
        return filter.apply(bp);
    }
    
    /**
     * 
     * @param author blueprint's author
     * @return all the blueprints of the given author
     * @throws BlueprintNotFoundException if the given author doesn't exist
     */
    public Set<Blueprint> getBlueprintsByAuthor(String author) throws BlueprintNotFoundException {
        Set<Blueprint> found = persistence.getBlueprintsByAuthor(author);
        if (found == null || found.isEmpty()) throw new BlueprintNotFoundException("No blueprints for author: " + author);

        Set<Blueprint> out = new HashSet<>();
        for (Blueprint bp : found) out.add(filter.apply(bp));
        return out;
    }

    /** Actualizar un plano existente */
    public void updateBlueprint(String author, String name, Blueprint updated) throws BlueprintNotFoundException {
        persistence.updateBlueprint(author, name, updated);
    }

    
}
