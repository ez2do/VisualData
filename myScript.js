console.log('Hi');
Chart.defaults.global.legend.display = false;
var backgroundColor = ["#2fc32f", "#b0dc0b", "#eab404", "#de672c", "#ec2e2e", "#d5429b", "#6f52b8", "#1c7cd5", "#56b9f7", "#0ae8eb"];
var attr1 = 'duration';
var range1 = 'today';
var host = 'https:localhost:9999';
var dataArray = [];

document.getElementById('show-data').addEventListener('click', function (e) {
    var attrSelector = document.getElementById('choose-attr1');
    attr1 = getSelectedOption(attrSelector);
    var rangeSelector = document.getElementById('choose-range1');
    range1 = getSelectedOption(rangeSelector);
    if (range1 == 'today') {
        //handle today data
        return;
    }
    sendRequest(`${host}/daily_domains/${attr1}/${range1}`);
});

function sendRequest(url) {
    var xhr = new XMLHttpRequest();
    xhr.addEventListener("load", function () {
        result = JSON.parse(this.responseText);
        console.log(result);
        if (result.success == false) {
            //handle error
            alert('Some error occur when getting data');
            return;
        }
        if(result.rowCount == 0){
            alert('There is no data');
            return;
        }
        //if sum is not integer
        if(!Number.isInteger(Number.parseInt(result.rows[0].sum))){
            //maping result.rows
            var rows = result.rows.map( obj => {
                var newObj = {};
                newObj.name = obj.name;
                newObj.sum = getSec(obj.sum);
                return newObj;
            });
        } else{
            var rows = result.rows.map( obj => {
                var newObj = {};
                newObj.name = obj.name;
                newObj.sum = Number.parseInt(obj.sum);
                return newObj;
            })
        }
        rows = rows.sort((a, b) => (a.sum < b.sum ? 1 : -1));
        console.log('Rows:', rows);

        //receive data successfully
        if (result.rowCount <= 10) {
            //get data normally
            dataArray = rows;
        } else {
            //get first 10 most valued rows, get all other rows to other
            var others = {name: 'others', sum: 0};
            for(item of rows.slice(9)){
                others.sum += item.sum;
            }
            dataArray = rows.slice(0, 9);
            dataArray.push(others);
        }
        console.log(dataArray);
        showData(dataArray);
    });
    xhr.open('GET', url);
    xhr.send();
}

function getSelectedOption(selector) {
    return selector.options[selector.selectedIndex].value;
}

function getSec(sum) {
    let totalSec = 0;
    if(sum.hours)    totalSec += 3600 * sum.hours;
    if(sum.minutes)  totalSec += 60 * sum.minutes;
    if(sum.seconds)  totalSec += sum.seconds;
    return totalSec;
}

function showData(dataArray){
    document.getElementById('myChart').remove();
    var ctx = document.createElement('canvas');
    ctx.setAttribute('id', 'myChart');
    document.getElementById('chart-1-container').appendChild(ctx);
    var domains = dataArray.map( obj => { return obj.name});
    var sums = dataArray.map(obj => {return obj.sum});

    var data = {
        datasets: [{
            data: sums,
            backgroundColor: backgroundColor
            //hoverBackgroundColor: []
        }],
    
        // These labels appear in the legend and in the tooltips when hovering different arcs
        labels: domains
    };

    var option = {}
    
    var myDoughnutChart = new Chart(ctx, {
        type: 'doughnut',
        data: data,
        option: option
    });
}