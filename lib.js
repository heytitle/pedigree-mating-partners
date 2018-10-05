let tempURL = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vRdNkvws7tYCFX0c3kJ6MY_ZBg8Rkygn5wdUb4GOImAJdk1Bl8msspK04JEVTc1rn70eZZqrs9RPsfz/pub?gid=0&single=true&output=csv';
angular.module('pedigreeApp', [])
    .controller('MainController', function($scope, $http) {
        $scope.url = tempURL;

            /*TODO : Mock Data*/
        // $scope.samples = []
            // for(let i = 0; i<100; i++){
            //     $scope.samples.push({
            //         id: 'ABC-' + i,
            //         mates: [
            //             'DDZ',
            //             'XYZ',
            //             'Dttu',
            //             'XY5Z'
            //         ]
            //     })
            // }
            //
        $scope.load = () => {
            $http({
                method: 'GET',
                url: $scope.url
            }).then((response) => {
                let body = response.data;
                Papa.parse(body, {
                    header: true,
                    complete: (results) => {
                        console.log(results);
                        $scope.samples = findMates(results.data);
                        console.log($scope.samples);
                    }
                })
            }, function errorCallback(response) {
                alert("ERROR!");
                console.log(response);
            });
        }

    });

function buildAncestors(sample) {
    let ancestorKeys = Object.keys(sample).filter( k => k != 'id' && k != 'gender' )
    return {
        id: sample.id,
        ancestors: new Set(ancestorKeys.map(k => sample[k]).filter(a => a))
    }
}

function sortSample(a, b){
    return a.id.localeCompare(b.id);
}

function findMates(data){
    let femaleSamples = data.filter( a => a.gender == 'F' )
        .map(buildAncestors)
        .sort(sortSample);

    let maleSamples = data.filter( a => a.gender == 'M' )
        .map(buildAncestors)
        .sort(sortSample);

    console.log('Female Samples');
    console.log(femaleSamples);

    let samples = [];
    femaleSamples.forEach( f => {
        let mates = maleSamples.filter( m => {
                let a = f.ancestors;
                let b = m.ancestors;
                let intersect = new Set([...a].filter(i => b.has(i)));
                return intersect.size == 0;
            }).map( m => m.id )

        samples.push({
            id: f.id,
            mates: mates
        })
    });

    console.log('xxx');
    console.log(samples);

    return samples;
}
