"use client";
import { VChart } from "@visactor/react-vchart";
import { numberToPercentage } from "@/lib/utils";
const getSpec = (label, color, percentage) => {
    return {
        type: "linearProgress",
        data: [
            {
                id: "id0",
                values: [
                    {
                        type: label,
                        value: percentage,
                    },
                ],
            },
        ],
        direction: "horizontal",
        xField: "value",
        yField: "type",
        seriesField: "type",
        height: 10,
        cornerRadius: 10,
        progress: {
            style: {
                cornerRadius: 0,
            },
        },
        color: [color],
        bandWidth: 10,
        padding: 0,
        tooltip: {
            trigger: ["click", "hover"],
            mark: {
                title: {
                    visible: false,
                },
                content: [
                    {
                        key: label,
                        value: (datum) => datum ? `${numberToPercentage(percentage)}` : "",
                    },
                ],
            },
        },
        axes: [
            {
                orient: "right",
                type: "band",
                domainLine: { visible: false },
                tick: { visible: false },
                label: {
                    formatMethod: () => numberToPercentage(percentage),
                },
                maxWidth: "60%",
                width: 36,
            },
        ],
    };
};
export default function LinearProgress({ label, color, percentage, icon, }) {
    return (<div>
      <div className="mb-1 flex items-center gap-x-2">
        {icon}
        <div>
          <div className="text-xs text-muted-foreground">{label}</div>
          <div className="text-xl font-medium">
            {numberToPercentage(percentage)}
          </div>
        </div>
      </div>
      <div className="relative">
        <VChart spec={getSpec(label, color, percentage)}/>
      </div>
    </div>);
}
