var imports = new JavaImporter(java.nio.file);
with (imports) {
    var _people = JSON.parse(new java.lang.String(
            Files.readAllBytes(Paths.get("src/main/resources/people.json"))));
    var people = Java.to(_people, 'java.util.List');
}

people.stream()
        .filter(function (person) {
            return person.age >= 18 &&
                    person.gender === 'FEMALE';
        })
        .map(function (person) {
            return person.email;
        })
        .forEach(function (email) {
            print(email);
        });
