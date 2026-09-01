package com.interview.model;

import java.util.HashMap;
import java.util.Map;

import lombok.Data;

@Data
public class DocumentManifest {

    private Map<String, String> chunks = new HashMap<>();

    private Map<String, String> sections = new HashMap<>();
}