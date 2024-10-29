package com.connectly.connectly.service;

import com.connectly.connectly.model.Group;
import com.connectly.connectly.repository.GroupRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class GroupService {
    private GroupRepository groupRepository;

    @Autowired
    public GroupService(GroupRepository groupRepository) {
        this.groupRepository = groupRepository;
    }

//    public List<Group> getAllGroups() {
//        var groups = groupRepository.findAll();
//
//    }
}
