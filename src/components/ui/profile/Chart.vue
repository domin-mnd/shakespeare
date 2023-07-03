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

const { username } = defineProps<{
  username: string;
}>();

const weekDays: string[] = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

const date = new Date();
date.setHours(0);
date.setMinutes(0);
date.setSeconds(0);
date.setMilliseconds(0);
// I hate it when week starts with sunday
const getISODay = (date: Date) => (date.getDay() + 6) % 7;

const first = date.setDate(date.getDate() - getISODay(date));
let gte = new Date(first).toISOString();
let lte = new Date(date.setDate(new Date(first).getDate() + 6)).toISOString();

const cookie = useCookie("api_key");

if (!cookie.value) {
  await navigateTo("/login");
}

const { data, error } = await useFetch("/api/views", {
  headers: {
    Authorization: cookie.value as string,
  },
  params: {
    gte,
    lte,
    username,
  },
});

if (error.value) {
  throw createError({
    statusCode: error.value.statusCode,
    statusMessage: error.value.statusMessage,
    message: error.value.message,
  });
}

// This one starts with sunday and ends with saturday but we will shift it
const weekData: number[] = [0, 0, 0, 0, 0, 0, 0];

for (let upload of data?.value ?? []) {
  weekData[new Date(upload.created_at).getDay()] += 1;
}

const sunday = weekData.shift();
</script>
<template>
  <div class="chart-parent">
    <Line
      id="chart"
      :data="{
        labels: weekDays,
        datasets: [
          {
            label: 'Views',
            data: [...weekData, sunday ?? 0],
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
              // and make own
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
  </div>
  <div id="week-days">
    <span v-for="day in weekDays" :key="day">{{ day }}</span>
  </div>
</template>
<style lang="stylus" scoped>
// Chart.js is dependent on parent element for responsiveness
.chart-parent
  width 100%
  aspect-ratio 2

#week-days
  display flex
  justify-content space-between

  margin-top ss-sm-7
  margin-left ss-sm-7
  margin-right ss-sm-7

  font-size fs-sm-10
  color cs-secondary
</style>
