<script setup lang="ts">
import { Line } from 'vue-chartjs'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js'

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

interface Props {
  name: string
  data: { value: number; recordedAt: string }[]
  unit?: string
  color?: string
}

const props = withDefaults(defineProps<Props>(), {
  color: '#22d3ee',
})

const chartData = computed(() => ({
  labels: props.data.map((d) =>
    new Date(d.recordedAt).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
    })
  ),
  datasets: [
    {
      label: props.name,
      data: props.data.map((d) => d.value),
      borderColor: props.color,
      backgroundColor: `${props.color}20`,
      fill: true,
      tension: 0.4,
    },
  ],
}))

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
    },
    tooltip: {
      mode: 'index' as const,
      intersect: false,
    },
  },
  scales: {
    x: {
      grid: {
        display: false,
      },
      ticks: {
        color: '#6b7280',
      },
    },
    y: {
      beginAtZero: false,
      ticks: {
        color: '#6b7280',
      },
      grid: {
        color: 'rgba(255,255,255,0.05)',
      },
    },
  },
}
</script>

<template>
  <div class="bg-slate-900/50 backdrop-blur-sm rounded-lg border border-white/5 p-4">
    <div class="flex items-center justify-between mb-4">
      <h3 class="font-medium text-white">{{ name }}</h3>
      <span v-if="unit" class="text-sm text-gray-500">{{ unit }}</span>
    </div>
    <div class="h-48">
      <Line v-if="data.length > 0" :data="chartData" :options="chartOptions" />
      <div v-else class="h-full flex items-center justify-center text-gray-500">
        No data available
      </div>
    </div>
  </div>
</template>
