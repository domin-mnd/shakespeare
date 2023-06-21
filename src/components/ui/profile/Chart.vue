<script lang="ts" setup>
import { Line } from "vue-chartjs";

import {
  Chart as ChartJS,
  Tooltip,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
} from "chart.js";
ChartJS.register(
  Tooltip,
  LineElement,
  CategoryScale,
  LinearScale,
  PointElement
);

const weekDays = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
</script>
<template>
  <Line
    id="chart"
    :data="{
      labels: weekDays,
      datasets: [
        {
          label: 'Views',
          data: [65, 59, 80, 81, 56, 55, 40],
          borderColor: '#C9C9C9',
          pointStyle: false,
        },
      ],
    }"
    :options="{
      responsive: true,
      layout: {
        autoPadding: false,
      },
      scales: {
        x: {
          ticks: {
            // This thing is giving useless gap so we basically remove ticks
            display: false,
          },
          grid: {
            color: (context) => {
              if (
                context.index === context.chart.scales.x.ticks.length - 1 ||
                context.index === 0
              )
                return 'transparent';
              return '#383838';
            },
            drawTicks: false,
          },
        },
        y: {
          ticks: {
            maxTicksLimit: 6,
            display: false,
          },
          grid: {
            color: (context) => {
              if (context.index === context.chart.scales.y.ticks.length - 1)
                return 'transparent';
              return '#383838';
            },
            drawTicks: false,
          },
        },
      },
    }"
  />
  <div id="week-days">
    <span v-for="day in weekDays" :key="day">{{ day }}</span>
  </div>
</template>
<style lang="stylus" scoped>
#week-days
  display flex
  justify-content space-between

  margin-top ss-sm-7
  margin-left ss-sm-7
  margin-right ss-sm-7

  font-size fs-sm-10
  color cs-secondary
</style>
