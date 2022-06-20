var rsrp = "";
var rsrq = "";
var rssi = "";
var sinr = "";
var ping = "";
var rfm = "";
var speedtest = 0;
var rsrp_list = []
var rsrq_list = []
var rssi_list = []
var sinr_list = []

var gradient12 = {
    type: 'linearGradient',
    x0: 0,
    y0: 0.5,
    x1: 1,
    y1: 0.5,
    colorStops: [{
        offset: 0,
        color: '#5ff502'
    }, {
        offset: 1,
        color: '#f50217'
    }]
};

var anchorGradient2 = {
    type: 'radialGradient',
    x0: 0.35,
    y0: 0.35,
    r0: 0.0,
    x1: 0.35,
    y1: 0.35,
    r1: 1,
    colorStops: [{
        offset: 0,
        color: '#4F6169'
    }, {
        offset: 1,
        color: '#252E32'
    }]
};

var state2 = {
    background: '#F7F7F7',
    border: {
        lineWidth: 4,
        strokeStyle: '#76786A',
        padding: 16
    },
    shadows: {
        enabled: true
    },
    anchor: {
        visible: true,
        fillStyle: anchorGradient2,
        radius: 0.10
    },
    tooltips: {
        disabled: false,
        highlighting: true
    },
    animation: {
        duration: 0.2
    },
    annotations: [{
        text: '',
        font: '18px sans-serif',
        horizontalOffset: 0.5,
        verticalOffset: 0.80
    }],
    scales: [{
        minimum: 0,
        maximum: 200,
        startAngle: 140,
        endAngle: 400,
        majorTickMarks: {
            length: 8,
            lineWidth: 1.5,
            interval: 10,
            offset: 0.84
        },
        minorTickMarks: {
            visible: true,
            length: 5,
            lineWidth: 1,
            interval: 2,
            offset: 0.84
        },
        labels: {
            orientation: 'horizontal',
            interval: 10,
            offset: 2
        },
        needles: [{
            value: 0,
            type: 'pointer',
            outerOffset: 0.8,
            mediumOffset: 0.7,
            width: 10,
            fillStyle: '#252E32'
        }],
        ranges: [{
            outerOffset: 0.82,
            innerStartOffset: 0.76,
            innerEndOffset: 0.68,
            startValue: 0,
            endValue: 200,
            fillStyle: gradient12
        }]
    }]
};
var radialGauge = new DataViz.RadialGauge(state2);

function updateRadialGauge(value) {
    if (value > 200) {
        state2.scales[0].needles[0].value = 200;
        state2.annotations[0].text = "google.fr\n" + value + "ms";
        radialGauge.setState(state2);
    } else {
        state2.scales[0].needles[0].value = value;
        state2.annotations[0].text = "google.fr\n" + value + "ms";
        radialGauge.setState(state2);
    }
}

radialGauge.write('test');

var barMarkerGradient = {
    type: 'linearGradient',
    x0: 0,
    y0: 1,
    x1: 0,
    y1: 0,
    colorStops: [{
        offset: 0,
        color: '#b21818'
    }, {
        offset: 0.5,
        color: '#fcf403'
    }, {
        offset: 1,
        color: '#0bd915'
    }]
};

var needleGradient = {
    type: 'linearGradient',
    x0: 0.5,
    y0: 0,
    x1: 0.5,
    y1: 1,
    colorStops: [{
        offset: 0,
        color: '#4F6169'
    }, {
        offset: 1,
        color: '#252E32'
    }]
};

var state = {
    orientation: 'vertical',
    background: '#F7F7F7',
    border: {
        padding: 10,
        lineWidth: 4,
        strokeStyle: '#76786A'
    },
    tooltips: {
        disabled: false,
        highlighting: false
    },
    animation: {
        enabled: true,
        duration: 0.2
    },
    scales: [{
        reversed: false,
        minimum: 0,
        maximum: 100,
        interval: 10,
        labels: {
            visible: true,
            offset: 0.02,
            font: '15px sans-serif'
        },
        majorTickMarks: {
            lineWidth: 3,
            offset: 0.1,
            length: 70
        },
        minorTickMarks: {
            length: 35,
            visible: true,
            lineWidth: 2,
            interval: 2,
            offset: 0.1
        },
        needles: [{
            type: 'rectangle',
            value: 0,
            fillStyle: needleGradient,
            innerOffset: 0.1,
            outerOffset: 0.9
        }],
        barMarkers: [{
            value: 100,
            fillStyle: barMarkerGradient,
            innerOffset: 0.10,
            outerOffset: 0.90
        }]
    }]

}

var linearGauge = new DataViz.LinearGauge(state);

function updateGauge(value) {
    state.scales[0].needles[0].value = value;
    linearGauge.setState(state);
    $('#rfmargin').text("RF-Margin: " + value + " %");
    if (value < 30) {
        $('#rfmargin').css('color', 'red');
    }
    if (value > 30 && value < 60) {
        $('#rfmargin').css('color', 'orange');
    }
    if (value > 60) {
        $('#rfmargin').css('color', 'lightgreen');
    }
    //setTimeout('updateGauge()', 200);
}

linearGauge.write('rf');

$('#btnSpeedTest').click(function() {
    $("#table1").css("display", "none");
    $("#table2").css("display", "none");
    $("#table3").css("display", "none");
    $("#table1 tr td").empty();
    $("#table2 tr td").empty();
    $("#table3 tr td").empty();

    if (rsrp <= -100) {
        $("#trsrp").css("color", "red");
    }
    if (rsrp > -100 && rsrp <= -90) {
        $("#trsrp").css("color", "gold");
    } else {
        $("#trsrp").css("color", "lightgreen");
    }
    $("#trsrp").append(rsrp);

    if (rsrq <= -20) {
        $("#trsrq").css("color", "red");
    }
    if (rsrq > -20 && rsrq <= -10) {
        $("#trsrq").css("color", "gold");
    } else {
        $("#trsrq").css("color", "lightgreen");
    }
    $("#trsrq").append(rsrq);

    if (rssi <= -85) {
        $("#trssi").css("color", "red");
    }
    if (rssi > -85 && rssi <= -75) {
        $("#trssi").css("color", "gold");
    } else {
        $("#trssi").css("color", "lightgreen");
    }
    $("#trssi").append(rssi);

    if (sinr <= 0) {
        $("#tsinr").css("color", "red");
    }
    if (sinr > 0 && sinr <= 10) {
        $("#tsinr").css("color", "gold");
    } else {
        $("#tsinr").css("color", "lightgreen");
    }
    $("#tsinr").append(sinr);

    if (ping >= 140) {
        $("#ping").css("color", "red");
    }
    if (ping < 140 && ping >= 80) {
        $("#ping").css("color", "gold");
    } else {
        $("#ping").css("color", "lightgreen");
    }
    $("#ping").append(ping + "ms");

    if (rfm <= 30) {
        $("#rfm").css("color", "red");
    }
    if (rfm > 30 && rfm <= 60) {
        $("#rfm").css("color", "gold");
    } else {
        $("#rfm").css("color", "lightgreen");
    }
    $("#rfm").append(rfm + "%");

    speedtest = 1;
    gatherValuesWhileSpeedtesting()

    $("#loading").css("display", "block");
    var request = $.ajax({
        type: 'GET',
        url: "speedtest",
        contentType: 'application/json;charset=UTF-8',
        data: {
            'rsrp': rsrp,
            'rsrq': rsrq,
            'rssi': rssi,
            'sinr': sinr,
            'rfm': rfm,
            'ping': ping
        }
    });

    request.done(function(msg) {
        speedtest = 0;
        dl = msg["dl"];
        up = msg["up"];
        $("#loading").css("display", "none");

        if (dl.split(" ").pop() === "MB/s") {
            if (dl.split(" ")[0] <= 2) {
                $("#dl").css("color", "red");
            }
            if (dl.split(" ")[0] > 2 && dl.split(" ")[0] <= 4) {
                $("#dl").css("color", "gold");
            } else {
                $("#dl").css("color", "lightgreen");
            }
        } else {
            $("#dl").css("color", "red");
        }
        $("#dl").append(msg["dl"]);

        if (up.split(" ").pop() === "MB/s") {
            $("#up").css("color", "lightgreen");
        } else {
            if (up.split(" ")[0] <= 500) {
                $("#up").css("color", "red");
            }
            if (up.split(" ")[0] > 500 && up.split(" ")[0] <= 800) {
                $("#up").css("color", "gold");
            } else {
                $("#up").css("color", "lightgreen");
            }
        }
        $("#up").append(msg["up"]);

        var arsrp = getAverageValues(rsrp_list);
        var arsrq = getAverageValues(rsrq_list);
        var arssi = getAverageValues(rssi_list);
        var asinr = getAverageValues(sinr_list);

        if (arsrp <= -100) {
        $("#arsrp").css("color", "red");
        }
        if (arsrp > -100 && arsrp <= -90) {
            $("#arsrp").css("color", "gold");
        } else {
            $("#arsrp").css("color", "lightgreen");
        }
        $("#arsrp").append(arsrp);

        if (arsrq <= -20) {
            $("#arsrq").css("color", "red");
        }
        if (arsrq > -20 && arsrq <= -10) {
            $("#arsrq").css("color", "gold");
        } else {
            $("#arsrq").css("color", "lightgreen");
        }
        $("#arsrq").append(arsrq);

        if (arssi <= -85) {
            $("#arssi").css("color", "red");
        }
        if (arssi > -85 && arssi <= -75) {
            $("#arssi").css("color", "gold");
        } else {
            $("#arssi").css("color", "lightgreen");
        }
        $("#arssi").append(arssi);

        if (asinr <= 0) {
            $("#asinr").css("color", "red");
        }
        if (asinr > 0 && asinr <= 10) {
            $("#asinr").css("color", "gold");
        } else {
            $("#asinr").css("color", "lightgreen");
        }
        $("#asinr").append(asinr);

        sendAverage()

        $("#table1").css("display", "block");
        $("#table2").css("display", "block");
        $("#table3").css("display", "block");
    });


});

function sendAverage(){
 var request = $.ajax({
        type: 'GET',
        url: "average",
        contentType: 'application/json;charset=UTF-8',
        data: {
            'arsrp': getAverageValues(rsrp_list),
            'arsrq': getAverageValues(rsrq_list),
            'arssi': getAverageValues(rssi_list),
            'asinr': getAverageValues(sinr_list)
        }
    });
}
function gatherValuesWhileSpeedtesting(){
    setInterval(function(){
        if (speedtest == 1) {
        rsrp_list.push(rsrp);
        rsrq_list.push(rsrq);
        rssi_list.push(rssi);
        sinr_list.push(sinr);
        console.log(rsrp_list);
        }
        else {
        return;
        }}, 1000);
}

function getAverageValues(list) {
    var sum = 0;
    for( var i = 0; i < list.length; i++ ){
        sum += parseInt( list[i], 10 );
    }
    var avg = sum/list.length;
    var average = Math.round(avg * 100) / 100;
    console.log(average);
    return average;
}

$('#btnCapture').click(function() {
    var element = document.querySelector("#capture");
    saveCapture(element)
})

$('#btnInfos').click(function() {
    var element = document.querySelector("#myModal");
    element.style.display = "block";
})

$('#close').click(function() {
    var element = document.querySelector("#myModal");
    element.style.display = "none";
})

function saveCapture(element) {
    html2canvas(element).then(function(canvas) {
        download(canvas.toDataURL("image/png"));
    })
}

function download(url) {
    var today = new Date();
    var date = today.getFullYear() + '-' + (today.getMonth() + 1) + '-' + today.getDate()
    var a = $("<a style='display:none' id='js-downloader'>").attr("href", url).attr("download", date + "-lte-graph.png").appendTo("body");
    a[0].click();
    a.remove();
}

function setGradient(chart) {
    var ctx = document.getElementById(chart).getContext("2d")
    var gradient = ctx.createLinearGradient(0, 0, 0, 150);
    if (chart === "sinr") {
        gradient.addColorStop(1, 'rgba(191,3,3,1)');
        gradient.addColorStop(0.50, 'rgba(195,168,10,1)');
        gradient.addColorStop(0.10, 'rgba(136,201,22,1)');
        gradient.addColorStop(0, 'rgba(3,111,22,1)');
    } else {
        gradient.addColorStop(1, 'rgba(191,3,3,1)');
        gradient.addColorStop(0.30, 'rgba(136,201,22,1)');
        gradient.addColorStop(0, 'rgba(3,111,22,1)');
    }
    return gradient;
}

$(document).ready(function() {
    const config = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "RSRP (-dBm)",
                backgroundColor: function(context) {
                    return setGradient("rsrp");
                },
                borderColor: 'rgb(255, 255, 255)',
                data: [],
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
                text: 'RSRP (-dBm)'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    barPercentage: 1,
                    categoryPercentage: 1,
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: ''
                    },
                    ticks: {
                        beginAtZero: false,
                        maxTicksLimit: 25,
                        maxRotation: 0,
                        minRotation: 0
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: '-dBm'
                    },
                    ticks: {
                        min: -120,
                        max: -80,
                        autoSkip: false,
                        maxTicksLimit: 50
                    }
                }]
            }
        }
    };

    const config2 = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "RSSI (dBm)",
                backgroundColor: function(context) {
                    return setGradient("rssi");
                },
                borderColor: 'rgb(255, 99, 132)',
                data: [],
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
                text: 'RSSI (-dBm)'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    barPercentage: 1,
                    categoryPercentage: 1,
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: ''
                    },
                    ticks: {
                        beginAtZero: true,
                        precision: 0,
                        maxTicksLimit: 25,
                        maxRotation: 0,
                        minRotation: 0
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: '-dBm'
                    },
                    ticks: {
                        beginAtZero: true,
                        min: -100,
                        max: -50,
                        autoSkip: false,
                        maxTicksLimit: 50
                    }
                }]
            }
        }
    };
    const config3 = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "RSRQ (-dB)",
                backgroundColor: function(context) {
                    return setGradient("rsrq");
                },
                borderColor: 'rgb(255, 99, 132)',
                data: [],
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
                text: 'RSRQ (-dB)'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    barPercentage: 1,
                    categoryPercentage: 1,
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: ''
                    },
                    ticks: {
                        beginAtZero: true,
                        precision: 0,
                        maxTicksLimit: 25,
                        maxRotation: 0,
                        minRotation: 0
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: '-dB'
                    },
                    ticks: {
                        beginAtZero: false,
                        min: 0,
                        max: -20,
                        autoSkip: false,
                        maxTicksLimit: 20
                    }
                }]
            }
        }
    };
    const config4 = {
        type: 'bar',
        data: {
            labels: [],
            datasets: [{
                label: "SINR (dB)",
                backgroundColor: function(context) {
                    return setGradient("sinr");
                },
                borderColor: 'rgb(255, 99, 132)',
                data: [],
                fill: true,
            }],
        },
        options: {
            responsive: true,
            maintainAspectRatio: false,
            title: {
                display: false,
                text: 'SINR (dB)'
            },
            tooltips: {
                mode: 'index',
                intersect: false,
            },
            hover: {
                mode: 'nearest',
                intersect: true
            },
            scales: {
                xAxes: [{
                    barPercentage: 1,
                    categoryPercentage: 1,
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: ''
                    },
                    ticks: {
                        beginAtZero: true,
                        precision: 0,
                        maxTicksLimit: 25,
                        maxRotation: 0,
                        minRotation: 0
                    }
                }],
                yAxes: [{
                    display: true,
                    scaleLabel: {
                        display: true,
                        labelString: 'dB'
                    },
                    ticks: {
                        beginAtZero: false,
                        min: -5,
                        max: 20,
                        autoSkip: false,
                        maxTicksLimit: 50
                    }
                }]
            }
        }
    };
    const context = document.getElementById('rsrp').getContext('2d');
    const context2 = document.getElementById('rssi').getContext('2d');
    const context3 = document.getElementById('rsrq').getContext('2d');
    const context4 = document.getElementById('sinr').getContext('2d');

    const lineChart = new Chart(context,config);
    const lineChart2 = new Chart(context2,config2);
    const lineChart3 = new Chart(context3,config3);
    const lineChart4 = new Chart(context4,config4);

    const source = new EventSource("/chart-data");
    source.onmessage = function(event) {
        const data = JSON.parse(event.data);

        rsrp = data.rsrp;
        rsrq = data.rsrq;
        rssi = data.rssi;
        sinr = data.sinr;
        ping = data.ping_google;
        rfm = data.rf_margin;
        config.data.labels.push(data.time);
        config.data.datasets[0].data.push(data.rsrp);
        config.data.datasets[0].label = "RSRP: " + data.rsrp + " -dBm";
        config.options.scales.xAxes[0].scaleLabel.labelString = "(Min: " + data.rsrp_min + ",     Max: " + data.rsrp_max + ",     Avg: " + data.rsrp_avg + ")";
        lineChart.update();
        config2.data.labels.push(data.time);
        config2.data.datasets[0].data.push(data.rssi);
        config2.data.datasets[0].label = "RSSI: " + data.rssi + " -dBm";
        config2.options.scales.xAxes[0].scaleLabel.labelString = "(Min: " + data.rssi_min + ",     Max: " + data.rssi_max + ",     Avg: " + data.rssi_avg + ")";
        lineChart2.update();
        config3.data.labels.push(data.time);
        config3.data.datasets[0].data.push(data.rsrq);
        config3.data.datasets[0].label = "RSRQ: " + data.rsrq + " -dB";
        config3.options.scales.xAxes[0].scaleLabel.labelString = "(Min: " + data.rsrq_min + ",     Max: " + data.rsrq_max + ",     Avg: " + data.rsrq_avg + ")";
        lineChart3.update();
        config4.data.labels.push(data.time);
        config4.data.datasets[0].data.push(data.sinr);
        config4.data.datasets[0].label = "SINR: " + data.sinr + " dB";
        config4.options.scales.xAxes[0].scaleLabel.labelString = "(Min: " + data.sinr_min + ",     Max: " + data.sinr_max + ",     Avg: " + data.sinr_avg + ")";
        lineChart4.update();
        updateGauge(data.rf_margin);
        updateRadialGauge(data.ping_google);

    }
});
