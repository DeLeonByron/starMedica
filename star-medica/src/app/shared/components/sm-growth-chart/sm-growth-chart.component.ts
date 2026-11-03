import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { DatePipe, DecimalPipe } from '@angular/common';

export interface SmGrowthMeasurement {
  date: string;
  value: number;
}

interface ChartPoint extends SmGrowthMeasurement {
  x: number;
  y: number;
}

@Component({
  selector: 'sm-growth-chart',
  standalone: true,
  imports: [DatePipe, DecimalPipe],
  templateUrl: './sm-growth-chart.component.html',
  styleUrl: './sm-growth-chart.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class SmGrowthChartComponent {
  readonly title = input.required<string>();
  readonly unit = input.required<string>();
  readonly measurements = input<readonly SmGrowthMeasurement[]>([]);
  readonly validationError = computed(() => {
    const measurements = this.measurements();
    if (measurements.some((measurement) =>
      !Number.isFinite(measurement.value)
      || measurement.value <= 0
      || !Number.isFinite(Date.parse(measurement.date))
    )) {
      return 'El gráfico contiene una medición inválida y no se puede representar.';
    }

    return '';
  });
  protected readonly chart = computed(() => {
    const measurements = this.measurements();
    if (this.validationError() || measurements.length === 0) {
      return null;
    }

    const ordered = measurements
      .map((measurement) => ({ ...measurement, timestamp: Date.parse(measurement.date) }))
      .sort((first, second) => first.timestamp - second.timestamp);
    const firstTimestamp = ordered[0].timestamp;
    const lastTimestamp = ordered[ordered.length - 1].timestamp;
    const minTimestamp = firstTimestamp === lastTimestamp ? firstTimestamp - 43_200_000 : firstTimestamp;
    const maxTimestamp = firstTimestamp === lastTimestamp ? lastTimestamp + 43_200_000 : lastTimestamp;
    const timeRange = maxTimestamp - minTimestamp;
    const minValue = Math.min(...ordered.map((measurement) => measurement.value));
    const maxValue = Math.max(...ordered.map((measurement) => measurement.value));
    const valuePadding = (maxValue - minValue) * 0.1 || Math.max(minValue * 0.1, 1);
    const lowerBound = Math.max(0, minValue - valuePadding);
    const upperBound = maxValue + valuePadding;
    const plot = { left: 76, right: 700, top: 24, bottom: 246 };

    const points: ChartPoint[] = ordered.map((measurement) => ({
      date: measurement.date,
      value: measurement.value,
      x: plot.left + ((measurement.timestamp - minTimestamp) / timeRange) * (plot.right - plot.left),
      y: plot.bottom - ((measurement.value - lowerBound) / (upperBound - lowerBound)) * (plot.bottom - plot.top)
    }));

    const yTicks = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      return {
        y: plot.bottom - ratio * (plot.bottom - plot.top),
        value: lowerBound + ratio * (upperBound - lowerBound)
      };
    });
    const xTicks = Array.from({ length: 5 }, (_, index) => {
      const ratio = index / 4;
      return {
        x: plot.left + ratio * (plot.right - plot.left),
        date: new Date(minTimestamp + ratio * timeRange)
      };
    });

    return {
      points,
      polyline: points.map((point) => `${point.x},${point.y}`).join(' '),
      yTicks,
      xTicks
    };
  });
}
