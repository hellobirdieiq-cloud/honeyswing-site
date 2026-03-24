const { Stage1Cross } = require('./Stage1Cross');
const { Stage2Corners } = require('./Stage2Corners');
const { Stage3Middle } = require('./Stage3Middle');
const { Stage4OLLEdges } = require('./Stage4OLLEdges');
const { Stage5OLLCorners } = require('./Stage5OLLCorners');
const { Stage6PLLCorners } = require('./Stage6PLLCorners');
const { Stage7PLLEdges } = require('./Stage7PLLEdges');

const ALL_STAGES = [
  Stage1Cross,
  Stage2Corners,
  Stage3Middle,
  Stage4OLLEdges,
  Stage5OLLCorners,
  Stage6PLLCorners,
  Stage7PLLEdges,
];

module.exports = {
  Stage1Cross, Stage2Corners, Stage3Middle,
  Stage4OLLEdges, Stage5OLLCorners,
  Stage6PLLCorners, Stage7PLLEdges,
  ALL_STAGES,
};
