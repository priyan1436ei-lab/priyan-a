import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import Svg, { Path, Circle, Line, Text as SvgText } from 'react-native-svg';
import { FinancialHealthAxis } from '../../../src/types';

interface RadarChartProps {
  axes?: FinancialHealthAxis[];
  data?: { label: string; value: number }[];
  width?: number;
  height?: number;
  size?: number;
}

export const MobileRadarChart: React.FC<RadarChartProps> = ({
  axes,
  data,
  size = 240,
  width,
  height,
}) => {
  const chartSize = size || width || 240;
  const normalizedAxes =
    data?.map((d) => ({
      axisId: d.label,
      categoryName: d.label,
      score: d.value,
      maxScore: 100,
      weight: 1,
      impactFactor: 1,
      status: 'GOOD',
      recommendation: '',
    })) ||
    axes || [
      { categoryName: 'Education', score: 80 },
      { categoryName: 'Retire', score: 90 },
      { categoryName: 'Home', score: 65 },
      { categoryName: 'Emergency', score: 95 },
    ];

  const center = chartSize / 2;
  const radius = chartSize / 2 - 35;
  const totalAxes = normalizedAxes.length || 4;
  const angleStep = (2 * Math.PI) / totalAxes;

  const points = normalizedAxes.map((axis, i) => {
    const angle = i * angleStep - Math.PI / 2;
    const normScore = Math.min(100, Math.max(0, axis.score)) / 100;
    const r = radius * normScore;
    const x = center + r * Math.cos(angle);
    const y = center + r * Math.sin(angle);
    return { x, y };
  });

  const polygonPath = points.map((p, i) => `${i === 0 ? 'M' : 'L'} ${p.x} ${p.y}`).join(' ') + ' Z';
  const gridLevels = [0.25, 0.5, 0.75, 1.0];

  return (
    <View style={styles.chartContainer}>
      <Svg width={chartSize} height={chartSize}>
        {gridLevels.map((lvl, idx) => (
          <Circle
            key={idx}
            cx={center}
            cy={center}
            r={radius * lvl}
            stroke="#334155"
            strokeWidth="1"
            fill="none"
          />
        ))}

        {normalizedAxes.map((_, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const x2 = center + radius * Math.cos(angle);
          const y2 = center + radius * Math.sin(angle);
          return (
            <Line
              key={i}
              x1={center}
              y1={center}
              x2={x2}
              y2={y2}
              stroke="#334155"
              strokeWidth="1"
            />
          );
        })}

        <Path
          d={polygonPath}
          fill="rgba(6, 182, 212, 0.35)"
          stroke="#06B6D4"
          strokeWidth="2.5"
        />

        {points.map((p, i) => (
          <Circle key={i} cx={p.x} cy={p.y} r="4" fill="#06B6D4" stroke="#0F172A" strokeWidth="1.5" />
        ))}

        {normalizedAxes.map((axis, i) => {
          const angle = i * angleStep - Math.PI / 2;
          const labelR = radius + 20;
          const lx = center + labelR * Math.cos(angle);
          const ly = center + labelR * Math.sin(angle);
          return (
            <SvgText
              key={i}
              x={lx}
              y={ly}
              fill="#94A3B8"
              fontSize="10"
              fontWeight="bold"
              textAnchor="middle"
              alignmentBaseline="middle"
            >
              {axis.categoryName}
            </SvgText>
          );
        })}
      </Svg>
    </View>
  );
};

interface BarChartProps {
  data: { label: string; amount: number; color?: string }[];
  height?: number;
}

export const MobileBarChart: React.FC<BarChartProps> = ({ data, height = 160 }) => {
  const maxAmount = Math.max(...data.map((d) => d.amount), 1000);

  return (
    <View style={[styles.barChartContainer, { height }]}>
      {data.map((item, idx) => {
        const pct = Math.min(100, Math.max(10, Math.round((item.amount / maxAmount) * 100)));
        return (
          <View key={idx} style={styles.barColumn}>
            <View style={styles.barTrack}>
              <View
                style={[
                  styles.barFill,
                  { height: `${pct}%`, backgroundColor: item.color || '#06B6D4' },
                ]}
              />
            </View>
            <Text style={styles.barLabel} numberOfLines={1}>{item.label}</Text>
          </View>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  chartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 10,
  },
  barChartContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingTop: 16,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
    gap: 6,
  },
  barTrack: {
    width: 14,
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 7,
    justifyContent: 'flex-end',
    overflow: 'hidden',
  },
  barFill: {
    width: '100%',
    borderRadius: 7,
  },
  barLabel: {
    color: '#94A3B8',
    fontSize: 9,
    fontWeight: 'bold',
  },
});
