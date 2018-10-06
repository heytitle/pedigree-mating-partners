let tempURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdNkvws7tYCFX0c3kJ6MY_ZBg8Rkygn5wdUb4GOImAJdk1Bl8msspK04JEVTc1rn70eZZqrs9RPsfz/pub?gid=0&single=true&output=csv';
let app = angular.module('pedigreeApp', ['ngFileUpload']);

app.controller('MainController', function($scope, $http) {
    $scope.url = tempURL;

    $scope.fileUpload = (file, _) => {
        console.log('File uploaded');
        console.log(file);

        $scope.fileName = file.name;

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                console.log(results);
                $scope.samples = findMates(results.data);
                console.log($scope.samples);
            }
        })
        // console.log('file upload');
    }
});

function buildAncestors(sample) {
    let ancestorKeys = Object.keys(sample).filter( k => k != 'ID' && k != 'SEX' )
    let ancestors = new Set(ancestorKeys.map( k => sample[k] )
                           .filter( a => a != VARIABLES.na) );
    return {
        id: sample.ID,
        ancestors: ancestors
    }
}

function sortSample(a, b){
    return a.id.localeCompare(b.id);
}

function findMates(data){
    data = data.filter( d => d.ID );
    console.log(data);

    let femaleSamples = data.filter( a => a.SEX == VARIABLES.female )
        .map(buildAncestors)
        .sort(sortSample);

    let maleSamples = data.filter( a => a.SEX == VARIABLES.male )
        .map(buildAncestors)
        .sort(sortSample);

    console.log('Female Samples');
    console.log(femaleSamples);

    let samples = [];
    maleSamples.forEach( m => {
        let mates = femaleSamples.filter( f => {
            let a = m.ancestors;
            let b = f.ancestors;
            let intersect = new Set([...a].filter(i => b.has(i)));
            return intersect.size == 0;
        }).map( f => f.id )

        samples.push({
            id: m.id,
            mates: mates.slice(0, 10)
        })
    });

    console.log('xxx');
    console.log(samples);

    return samples;
}
