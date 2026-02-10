import * as aws from "@pulumi/aws";

const dashboardBody = {
  widgets: [
    {
      type: "metric",
      x: 0,
      y: 0,
      width: 12,
      height: 6,
      properties: {
        title: "Request Volume",
        metrics: [["KorpoBingo", "RequestCount", { stat: "Sum", period: 300 }]],
        view: "timeSeries",
        region: "us-east-1",
        period: 300,
      },
    },
    {
      type: "metric",
      x: 12,
      y: 0,
      width: 12,
      height: 6,
      properties: {
        title: "Error Rate",
        metrics: [["KorpoBingo", "ErrorCount", { stat: "Sum", period: 300 }]],
        view: "timeSeries",
        region: "us-east-1",
        period: 300,
      },
    },
    {
      type: "metric",
      x: 0,
      y: 6,
      width: 12,
      height: 6,
      properties: {
        title: "Latency (p50 / p90 / p99)",
        metrics: [
          ["KorpoBingo", "Duration", { stat: "p50", period: 300 }],
          ["KorpoBingo", "Duration", { stat: "p90", period: 300 }],
          ["KorpoBingo", "Duration", { stat: "p99", period: 300 }],
        ],
        view: "timeSeries",
        region: "us-east-1",
        period: 300,
      },
    },
    {
      type: "metric",
      x: 12,
      y: 6,
      width: 12,
      height: 6,
      properties: {
        title: "Request Volume by Endpoint",
        metrics: [
          ["KorpoBingo", "RequestCount", "Method", "GET", "Path", "/rounds", { stat: "Sum" }],
          ["KorpoBingo", "RequestCount", "Method", "POST", "Path", "/rounds", { stat: "Sum" }],
          ["KorpoBingo", "RequestCount", "Method", "GET", "Path", "/boards", { stat: "Sum" }],
          ["KorpoBingo", "RequestCount", "Method", "POST", "Path", "/boards", { stat: "Sum" }],
          ["KorpoBingo", "RequestCount", "Method", "GET", "Path", "/players", { stat: "Sum" }],
          ["KorpoBingo", "RequestCount", "Method", "POST", "Path", "/players", { stat: "Sum" }],
          ["KorpoBingo", "RequestCount", "Method", "GET", "Path", "/words", { stat: "Sum" }],
          ["KorpoBingo", "RequestCount", "Method", "POST", "Path", "/words", { stat: "Sum" }],
        ],
        view: "timeSeries",
        region: "us-east-1",
        period: 300,
      },
    },
  ],
};

export const dashboard = new aws.cloudwatch.Dashboard("KorpoBingoDashboard", {
  dashboardName: $interpolate`korpobingo-${$app.stage}`,
  dashboardBody: JSON.stringify(dashboardBody),
});
