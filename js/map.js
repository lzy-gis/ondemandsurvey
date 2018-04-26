 var map;
 var zoom = 10;


 function loadmap() {
     //initialize
     //获得当前日期
     getDate();
     //绑定事件






     require(["esri/map",
      "esri/layers/FeatureLayer",
      "esri/dijit/FeatureTable",
      "esri/layers/CSVLayer",
      "esri/Color",
      "esri/symbols/SimpleMarkerSymbol",
      "esri/renderers/SimpleRenderer",
      "esri/renderers/ScaleDependentRenderer",
      "esri/renderers/HeatmapRenderer",       
      "esri/InfoTemplate",
      "esri/config", "dojo/dom-construct",
      "dojo/dom",
      "dojo/parser",
      "dojo/ready",
      "dojo/on",
      "dojo/_base/lang",
      "dijit/registry",
      "dijit/form/Button",
      "dijit/layout/ContentPane",
      "dijit/layout/BorderContainer",
      "dijit/form/TextBox"], function (Map, FeatureLayer, FeatureTable, CSVLayer, Color, SimpleMarkerSymbol, SimpleRenderer, ScaleDependentRenderer,HeatmapRenderer,InfoTemplate, esriConfig, domConstruct, dom, parser, ready, on, lang, registry, Button, ContentPane, BorderContainer, TextBox) {

         map = new Map("mapDiv", {
             center: [120.71, 28.02],
             zoom: zoom,
             basemap: "osm",
             sliderPosition: "bottom-left"
         });

         map.on("load", function () {
             var csv = new CSVLayer("data/all.csv", {
                 copyright: "http://www.zjasm.net/"
             });
             var orangeRed = new Color([238, 69, 0, 1]); // hex is #ff4500
             var marker = new SimpleMarkerSymbol("solid", 12, null, orangeRed);
             var renderer = new SimpleRenderer(marker);

             // set a selection symbol for the featurelayer
             var selectionSymbol = new SimpleMarkerSymbol("solid", 20, null, new Color([0, 255, 197, 1]));
             csv.setSelectionSymbol(selectionSymbol);
             
             var heatmapRenderer = new HeatmapRenderer({
                colors: ["rgba(255, 0, 0, 0)","rgba(255, 0, 0,0.6)","rgb(255, 0, 0)", "rgb(255, 255, 0)","rgb(255, 255, 255)"],
                blurRadius: 15,
                maxPixelIntensity: 200,
                minPixelIntensity: 0
            });

             
             var scaleDependentRenderer = new ScaleDependentRenderer({
              rendererInfos: [{
                renderer: renderer,
                maxZoom: 20,
                minZoom: 10
              }, {
                renderer: heatmapRenderer,
                maxZoom: 9,
                minZoom: 2
              }]
            });

             
             
             
             csv.setRenderer(scaleDependentRenderer);
             
             var template = new InfoTemplate("${要素类型}", "变化要素名称：${变化名称},<br>变化阶段：${变化阶段}");
             csv.setInfoTemplate(template);
             map.addLayer(csv);

             csv.on("load", function (evt) {

                 $("#ChangeNum").text(evt.layer.graphics.length);
                 var myFeatureTable = new FeatureTable({
                     featureLayer: evt.layer,
                     outFields: ["变化名称", "变化阶段", "要素类型", "发现变化时间", "3613规则"],
                     map: map,
                     syncSelection: true,
                     zoomToSelection: true,
                     showGridHeader: false
                 }, 'myTableNode');

                 myFeatureTable.startup();
             });
         });



     });


     changeClues();

     changeTrend();

     changeDistribution();

     changeCategory();
 }

 function getDate() {
     var now = new Date();
     //document.write("今天是"+now.year()+"年"+now.month()+"月"+now.day()+“日”);

     $("#currentDate").text(now.getFullYear() + "年" + String(now.getMonth() + 1) + "月" + now.getDate() + "日");

 }

 function changeClues() {

     var myChart = echarts.init(document.getElementById('echart_clues'));
     myChart.showLoading();
     $.get('data/flare.json', function (data) {
         myChart.hideLoading();

         echarts.util.each(data.children, function (datum, index) {
             index % 2 === 0 && (datum.collapsed = true);
         });

         myChart.setOption(option = {
             title: {
                 text: "要素变化线索图"
             },
             tooltip: {
                 trigger: 'item',
                 triggerOn: 'mousemove'
             },
             series: [
                 {
                     type: 'tree',

                     data: [data],

                     top: '1%',
                     left: '7%',
                     bottom: '1%',
                     right: '7%',

                     symbolSize: 7,

                     label: {
                         normal: {
                             position: 'left',
                             verticalAlign: 'middle',
                             align: 'right',
                             fontSize: 9
                         }
                     },

                     leaves: {
                         label: {
                             normal: {
                                 position: 'right',
                                 verticalAlign: 'middle',
                                 align: 'left'
                             }
                         }
                     },

                     expandAndCollapse: true,
                     animationDuration: 550,
                     animationDurationUpdate: 750
            }
        ]
         });
     });

 }

 function changeTrend() {
     var myChart = echarts.init(document.getElementById('echart_trend'));

     // 指定图表的配置项和数据
     var option = {
         title: {
             text: '全省变化要素趋势图',subtext: '近六个月'
         },
         tooltip: {},
         
         xAxis: {
             data: ["1", "2", "3", "4", "5", "6"]
         },
         yAxis: {},
         series: [{
             name: '变化量',
             type: 'bar',
             data: [5, 20, 36, 10, 10, 20]
            }]
     };

     // 使用刚指定的配置项和数据显示图表。
     myChart.setOption(option);

 }

 function changeDistribution() {

     var myChart = echarts.init(document.getElementById('echart_map'));
     myChart.showLoading();

     $.get('data/zhejiang3.json', function (geoJson) {

         myChart.hideLoading();

         echarts.registerMap('Zhejiang', geoJson);

         myChart.setOption(option = {
             title: {
                 text: '全省变化要素空间分布图',
                 subtext: '近一个月'
             },
             series: [
                 {
                     name: 'Zhejiang Change',
                     type: 'map',
                     roam: false,
                     map: 'Zhejiang'

                 }]

         });
     });

 }


 function changeCategory() {
     var myChart = echarts.init(document.getElementById('echart_category'));

     var option = {
         tooltip: {
             trigger: 'item',
             formatter: "{a} <br/>{b}: {c} ({d}%)"
         },
         legend: {
             orient: 'vertical',
             x: 'left',
             data: ['省道', '国道', '居民点', '水系', '大坝', '铁路', '百度', '谷歌', '必应', '其他']
         },
         series: [
             {
                 name: '访问来源',
                 type: 'pie',
                 selectedMode: 'single',
                 radius: [0, '30%'],

                 label: {
                     normal: {
                         position: 'inner'
                     }
                 },
                 labelLine: {
                     normal: {
                         show: false
                     }
                 },
                 data: [
                     {
                         value: 335,
                         name: '道路',
                         selected: true
                    },
                     {
                         value: 679,
                         name: '建筑物'
                    },
                     {
                         value: 1548,
                         name: '水系'
                    }
            ]
        },
             {
                 name: '访问来源',
                 type: 'pie',
                 radius: ['40%', '55%'],

                 data: [
                     {
                         value: 335,
                         name: '省道'
                    },
                     {
                         value: 310,
                         name: '国道'
                    },
                     {
                         value: 234,
                         name: 'POI'
                    },
                     {
                         value: 135,
                         name: '铁路'
                    },
                     {
                         value: 1048,
                         name: '商业区'
                    },
                     {
                         value: 251,
                         name: '大坝'
                    },
                     {
                         value: 147,
                         name: '居民点'
                    },
                     {
                         value: 102,
                         name: '其他'
                    }
            ]
        }
    ]
     };
     myChart.setOption(option);





 }
