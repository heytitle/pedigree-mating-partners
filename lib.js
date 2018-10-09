let tempURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdNkvws7tYCFX0c3kJ6MY_ZBg8Rkygn5wdUb4GOImAJdk1Bl8msspK04JEVTc1rn70eZZqrs9RPsfz/pub?gid=0&single=true&output=csv';
let app = angular.module('pedigreeApp', ['ngFileUpload']);

app.controller('MainController', function($scope, $http) {
    $scope.url = tempURL;
    $scope.comparingLevels = [
        {
            label: 'level-1',
            ancestorKeys: ['C1', 'S1']
        },
        {
            label: 'level-1,2',
            ancestorKeys: ['C1', 'S1', 'C2', 'S2', 'C3', 'S3']
        },
        {
            label: 'level-1,2,3',
            ancestorKeys: ['C1', 'S1', 'C2', 'S2', 'C3', 'S3', 'C4', 'S4', 'C5', 'S5', 'C6', 'S6', 'C7', 'S7']
        }
    ];

    $scope.comparingLevel = $scope.comparingLevels[0];

    $scope.fileUpload = (file, _) => {
        console.log('File uploaded');
        console.log(file);

        $scope.fileName = file.name;

        Papa.parse(file, {
            header: true,
            complete: (results) => {
                console.log(results);
                $scope.data = results.data;

                $scope.process();
            }
        })
    }

    $scope.process = () => {
        console.log('Process');
        $scope.samples = findMates($scope.data, $scope.comparingLevel);
        $scope.$apply();
    }
});

function buildAncestors(sample, ancestorKeys) {
    let ancestors = new Set(ancestorKeys.map( k => sample[k] )
                            .filter( a => a != VARIABLES.na && a) );
                        return {
                            id: sample.ID,
                            ancestors: ancestors
                        }
}

function sortSample(a, b){
    return a.id.localeCompare(b.id);
}

function findMates(data, level){
    data = data.filter( d => d.ID );
    console.log(data);

    let femaleSamples = data.filter( a => a.SEX == VARIABLES.female )
        .map(a => buildAncestors(a, level.ancestorKeys))
        .sort(sortSample);
    console.log('No. females.' + femaleSamples.length);
    console.log(femaleSamples)

    let maleSamples = data.filter( a => a.SEX == VARIABLES.male )
        .map(a => buildAncestors(a, level.ancestorKeys))
        .sort(sortSample);
    console.log('No. males.' + maleSamples.length);

    let samples = [];
    maleSamples.forEach( m => {
        let mates = femaleSamples.map(f => {
            let a = m.ancestors;
            let b = f.ancestors;
            let intersect = new Set([...a].filter(i => b.has(i)));

            return {
                id: f.id,
                commonAncestors: intersect,
                commonAncestorStr: [...intersect].join(',')
            }
        }).filter( f => f.commonAncestors.size > 0 );

        samples.push({
            id: m.id,
            mates: mates
        })
    });

    console.log('xxx');
    console.log(samples);

    return samples;
}
