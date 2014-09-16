var _people = [
    {
        "_id": "5414b6e75a3de007713250d6",
        "givenName": "Ferrell",
        "surName": "Vance",
        "age": 44,
        "gender": "MALE",
        "email": "ferrellvance@megall.com",
        "phone": "+55 (984) 589-2485",
        "address": "153 Moffat Street, Gerber, Florida, 3324"
    },
    {
        "_id": "5414b6e7ef339a108687180c",
        "givenName": "Gomez",
        "surName": "Valentine",
        "age": 60,
        "gender": "MALE",
        "email": "gomezvalentine@megall.com",
        "phone": "+55 (885) 407-2680",
        "address": "427 Folsom Place, Marne, Tennessee, 803"
    },
    {
        "_id": "5414b6e7c59b8dbfad9433d0",
        "givenName": "Roman",
        "surName": "Beck",
        "age": 49,
        "gender": "MALE",
        "email": "romanbeck@megall.com",
        "phone": "+55 (999) 528-2951",
        "address": "695 Berry Street, Linwood, Minnesota, 9844"
    },
    {
        "_id": "5414b6e77a0a98c177a1b5fb",
        "givenName": "Vargas",
        "surName": "Stephenson",
        "age": 38,
        "gender": "MALE",
        "email": "vargasstephenson@megall.com",
        "phone": "+55 (808) 542-3602",
        "address": "244 Oriental Court, Klagetoh, Utah, 1439"
    },
    {
        "_id": "5414b6e7ae6e320fb76bea6b",
        "givenName": "Mayer",
        "surName": "Graham",
        "age": 43,
        "gender": "MALE",
        "email": "mayergraham@megall.com",
        "phone": "+55 (919) 568-3927",
        "address": "338 Franklin Avenue, Southmont, North Carolina, 202"
    }
];

var people = Java.to(_people, 'java.util.List');

people.stream().forEach(function (person) {
    print(person.givenName);
});
