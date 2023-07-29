let rawData = {}
let data = []
let level = 0
let parentId = ''

function getTotalsFromCurrentId(id) {
  let [platform, category, region] = id.split(' ')
  let tmp = {
    total: 0,
    complete: 0,
    percentage: 0
  }

  if (typeof platform !== 'undefined') {
    tmp.total = rawData[platform].total
    tmp.complete = rawData[platform].complete
    tmp.percentage = rawData[platform].percentage
  }
  if (typeof category !== 'undefined') {
    tmp.total = rawData[platform][category].total
    tmp.complete = rawData[platform][category].complete
    tmp.percentage = rawData[platform][category].percentage
  }
  if (typeof region !== 'undefined') {
    tmp.total = rawData[platform][category][region].total
    tmp.complete = rawData[platform][category][region].complete
    tmp.percentage = rawData[platform][category][region].percentage
  }
  return tmp
}

function parseData(d) {
  let data = []

  let platforms = Object.keys(d)

  let dataTemplate = function(arg, val, parentId) {
    return {
      arg: arg,
      val: val ? Number(val) : 0,
      parentId: parentId ? parentId : ''
    }
  }

  for (let platform of platforms) {
    data.push(dataTemplate(platform, d[platform].percentage, ''))
    let categories = Object.keys(d[platform]).filter(x => typeof d[platform][x] == 'object')

    for (let category of categories) {
      data.push(dataTemplate(`${platform} ${category}`, d[platform][category].percentage, platform))
      let regions = Object.keys(d[platform][category]).filter(x => typeof d[platform][category][x] == 'object')

      for (let region of regions) {
        data.push(dataTemplate(`${platform} ${category} ${region}`, d[platform][category][region].percentage, `${platform} ${category}`))
      }
    }
  }

  return data
}



function setupGraph(d) {
  var colors = ["#6babac", "#e55253", '#9480e5'];

  rawData = d
  data = parseData(d)

  // let isFirstLevel = true
  let chartContainer = $("#chart")
  let chart = chartContainer.dxChart({
    dataSource: filterData(''),
    title: {
      text: "PSN Completion %",
      font: {
        family: '"Verdana", "Arial", sans-serif'
      }
    },
    export: {
      enabled: true
    },
    series: [{
      argumentField: 'arg',
      valueField: 'val',
      type: 'bar'
    }],
    legend: {
      visible: false
    },
    valueAxis: {
      name: 'percentage',
      position: 'left',
      showZero: true,
      label: {
        customizeText: function(arg) {
          return arg.valueText + '%'
        },
        overlappingBehavior: 'stagger'
      },
      type: 'continuous',
      tickInterval: 20,
      visualRange: {
        startValue: 0,
        endValue: 100
      }
    },
    argumentAxis: {
      label: {
        overlappingBehavior: 'stagger'
      }
    },
    tooltip: {
      enabled: true,
      customizeTooltip: function(arg) {
        return {
          html: `<h3>${arg.valueText}%</h3><br />` +
            `<b>Total: ${getTotalsFromCurrentId(arg.argumentText).total}<br />` +
            `Complete: ${getTotalsFromCurrentId(arg.argumentText).complete}</b>`
          // text: '<b>arg.argumentText + " - " + arg.valueText
        }
      }
    },
    onPointClick: function (e) {
      level > 0 ? parentId = e.target.data.parentId : parentId = ''

      if (level === 0) {
        level = 1
        chart.option({
          dataSource: filterData(e.target.originalArgument)
        })

        // $("#backButton")
        //   .dxButton("instance")
        //   .option("visible", false);
      }
      else if (level === 1) {
        level = 2
        chart.option({
          dataSource: filterData(e.target.originalArgument)
        })

        // $("#backButton")
        //   .dxButton("instance")
        //   .option("visible", true);
      }
      else if (level == 2) {
        level = 0
        chart.option("dataSource", filterData(''))
        // $("#backButton")
        //   .dxButton("instance")
        //   .option("visible", false);
      }
      // if (isFirstLevel) {
      //   isFirstLevel = false;
      //   removePointerCursor(chartContainer);
      //   chart.option({
      //     dataSource: filterData(e.target.originalArgument)
      //   });
      //   $("#backButton")
      //     .dxButton("instance")
      //     .option("visible", true);
      // }
    },
    customizePoint: function () {
      var pointSettings = {
        color: colors[Number(level)]
      };

      // if (level) {
      //   pointSettings.hoverStyle = {
      //     hatching: "none"
      //   };
      // }

      return pointSettings;
    }
  }).dxChart("instance");

  // $("#backButton").dxButton({
  //   text: "Back",
  //   icon: "chevronleft",
  //   visible: false,
  //   onClick: function () {
  //     if (level > 0) {
  //       level -= 1;
  //       addPointerCursor(chartContainer);
  //       chart.option("dataSource", filterData(`${parentId}`));
  //       this.option("visible", true);
  //     }
  //   }
  // });

  addPointerCursor(chartContainer);



  function filterData(name) {
    if (!data.length) {
      if (level > 1) {
        return parseData(d).filter(function (item) {
          return item.arg === name;
        });
      }
      return parseData(d).filter(function (item) {
        return item.parentId === name;
      });
    }

    if (level > 1) {
      return data.filter(function (item) {
        return item.parentId === name;
      });
    }

    return data.filter(function (item) {
      return item.parentId === name;
    });
  }

  function addPointerCursor(container) {
    container.addClass("pointer-on-bars");
  }

  function removePointerCursor(container) {
    container.removeClass("pointer-on-bars");
  }
}






// function setupGraph(d) {
//
//   console.log(d)
//
//   let platforms = Object.keys(d)
//
//   let categories = {}
//
//   platforms.map(x => {
//     categories[x] = {}
//     categories[x] = Object.keys(d[x]).filter(y => {
//       if (typeof d[x][y] == 'object') return d[x][y]
//     })
//   })
//   let labels = []
//   let dataSets = []
//
//   function genLabel(platform) {
//     return {
//       label: platform,
//       expand: false,
//       children: categories[platform].map(x => {
//         let tmp = {}
//         tmp[x] = {
//           label: x,
//           expand: false,
//           children: d[platform][x]
//         }
//         // tmp[x] = d[platform][x]
//         // tmp[categories[platform]] = {
//         //   [x]: d[platform][x]
//         // }
//         return tmp
//       })
//     }
//   }
//
//   function genDataset(labels) {
//
//     for (let label of labels) {
//       let categories = label.children.map(x => Object.keys(x).toString())
//
//
//       // let regions = []
//
//       categories.forEach(category => {
//
//         console.log(category)
//
//
//         let regions = label.children.find(x => x = category)[category].children
//         // regions.filter(x => typeof x == 'object')
//         // regions = label.children[category].children.map(r => Object.keys(r).toString())
//
//
//
//
//         console.log(regions)
//
//         let t = {
//           label: category,
//           tree: [
//             regions.percentage,
//             regions['US'].percentage,
//             regions['EU'].percentage,
//             regions['JP'].percentage,
//             regions['ASIA'].percentage
//
//           ]
//         }
//
//         dataSets.push(t)
//
//
//       })
//       console.log(categories)
//       console.log(label)
//
//     }
//
//     // let children = label.children
//     //
//     // let tmp = []
//     //
//     // for (let i = 0; i < children.length; i++) {
//     //   let category = Object.keys(children[i])[0]
//     //
//     //   let regions = children[i][category].children.filter(x => typeof x == 'object')
//     //   // let regions = Object.keys(category.children).filter(x => typeof category[x] == 'object')
//     //   // let regions = children[i][category].children.filter(x => typeof children[x] === 'object')
//     //
//     //   tmp.push({
//     //       label: category,
//     //       tree: [
//     //         children[i][category].children.percentage
//     //       ]
//     //     })
//     // }
//     //
//     // return tmp
//   }
//
//   for (let platform of platforms) {
//     let label = genLabel(platform)
//
//     labels.push(label)
//   }
//
//   genDataset(labels)
//
//   // console.debug(labels)
//
//
//   const data = {
//     // define label tree
//     labels: labels,
//
//     datasets: dataSets
//     // datasets: [
//     //   {
//     //   label: 'PSV',
//     //   tree: [
//     //     80,
//     //     {
//     //       value: 1200,
//     //       children: [
//     //         870,
//     //         787,
//     //         1129,
//     //         349
//     //       ]
//     //     }
//     //   ]
//     // }
//     // ]
//   }
//
//
//   // const data = {
//   //   // define label tree
//   //   labels: [
//   //     {
//   //       label: 'PSV',
//   //       expand: false,
//   //       children: ['US', 'EU', 'JP', 'ASIA']
//   //     },
//   //     {
//   //       label: 'PS3',
//   //       expand: false,
//   //       children: ['US', 'EU', 'JP', 'ASIA']
//   //     }
//   //   ],
//   //
//   //   datasets: [
//   //     {
//   //       label: 'Games',
//   //       tree: [
//   //         {
//   //           value: 0,
//   //           children: [99.43, 87.8, 66.52, 60.46]
//   //         },
//   //         {
//   //           value: 0,
//   //           children: [87.08, 70.7, 33.54, 5.28]
//   //         }
//   //       ]
//   //     }
//   //   ]
//   //   // datasets: [
//   //   //   {
//   //   //   label: 'PSV',
//   //   //   tree: [
//   //   //     80,
//   //   //     {
//   //   //       value: 1200,
//   //   //       children: [
//   //   //         870,
//   //   //         787,
//   //   //         1129,
//   //   //         349
//   //   //       ]
//   //   //     }
//   //   //   ]
//   //   // }
//   //   // ]
//   // }
//
//   const ctx = document.getElementById('canvas').getContext('2d')
//   window.myBar = new Chart(ctx, {
//     type: 'bar',
//     data: data,
//     options: {
//       responsive: true,
//       title: {
//         display: true,
//         text: 'PSN Completion %'
//       },
//       layout: {
//         padding: {
//           // add more space at the bottom for the hierarchy
//           bottom: 45
//         }
//       },
//       scales: {
//         xAxes: [
//           {
//             type: 'hierarchical',
//             // offset setings, for centering the categorical axis in the bar chart case
//             offset: true,
//
//             // grid line settings
//             gridLines: {
//               offsetGridLines: true
//             }
//           }
//         ],
//         yAxes: [
//           {
//             ticks: {
//               beginAtZero: true
//             }
//           }
//         ]
//       }
//     }
//   })
// }