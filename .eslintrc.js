module.exports = {
    "env": {
        "browser": true,
        "node": true,
        "amd": true
    },
    "rules": {
        "curly": [
            "error",
            "all"
        ],
        "eqeqeq": [
            "error",
            "always"
        ],
        "wrap-iife": [
            "error",
            "any"
        ],
        "no-use-before-define": [
            "error",
            { "functions": true, "variables": true, "classes": true}
        ],
        "new-cap": [
            "error",
            { "newIsCap": true }
        ],
        "no-caller": "error",
        //"dot-notation": "error",
        "no-undef": "error",
        /*"no-cond-assign": [
            "error", {"always": true }
        ]*/
        //"no-eq-null": "error",
        // the browser field in jshint exists above ni the "env" field
        //"no-eval": "error",
        /*"no-irregular-whitespace": [
            "error": true,
            {
                "skipStrings": true,
                "skipRegExps": true,
                "skipTemplates": true,
                "skipComments": true              
            }
        ]*/
        "max-depth": [
            "error",
            4
        ],
        "max-statements": [
            "error",
            25
        ],
        // use --max-warnings in command https://eslint.org/docs/user-guide/command-line-interface
        /*
        "indent": [
            "error",
            4
        ],
        "linebreak-style": [
            "error",
            "windows"
        ],
        "quotes": [
            "error",
            "single"
        ],
        "semi": [
            "error",
            "always"
        ]*/
    }
};