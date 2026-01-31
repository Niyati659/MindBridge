import { useMemo } from 'react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import type { MoodLog } from '../../types';

interface MoodChartProps {
    moods: MoodLog[];
}

const moodToValue = (mood: string): number => {
    switch (mood) {
        case 'good': return 3;
        case 'neutral': return 2;
        case 'bad': return 1;
        default: return 2;
    }
};

const moodColors = {
    good: '#10b981',
    neutral: '#f59e0b',
    bad: '#ef4444',
};

export const MoodChart = ({ moods }: MoodChartProps) => {
    const chartData = useMemo(() => {
        // Get last 14 days of data
        const last14Days = [...Array(14)].map((_, i) => {
            const date = new Date();
            date.setDate(date.getDate() - (13 - i));
            return date.toISOString().split('T')[0];
        });

        return last14Days.map(date => {
            const dayMood = moods.find(m => m.date === date);
            return {
                date: new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
                value: dayMood ? moodToValue(dayMood.mood) : null,
                mood: dayMood?.mood || null,
            };
        });
    }, [moods]);

    const averageMood = useMemo(() => {
        const validMoods = moods.slice(0, 7);
        if (validMoods.length === 0) return null;
        const avg = validMoods.reduce((acc, m) => acc + moodToValue(m.mood), 0) / validMoods.length;
        return avg >= 2.5 ? 'Positive' : avg >= 1.5 ? 'Neutral' : 'Low';
    }, [moods]);

    if (moods.length === 0) {
        return (
            <div style={{
                padding: 24,
                textAlign: 'center',
                color: '#666'
            }}>
                <p>No mood data yet. Start logging to see trends!</p>
            </div>
        );
    }

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
                <h3 style={{ fontSize: 16, fontWeight: 600, color: 'white' }}>Mood Trends</h3>
                {averageMood && (
                    <span style={{
                        fontSize: 12,
                        padding: '4px 10px',
                        borderRadius: 12,
                        background: averageMood === 'Positive' ? 'rgba(16, 185, 129, 0.1)' :
                            averageMood === 'Neutral' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: averageMood === 'Positive' ? '#10b981' :
                            averageMood === 'Neutral' ? '#f59e0b' : '#ef4444',
                    }}>
                        {averageMood} this week
                    </span>
                )}
            </div>

            <div style={{ height: 200 }}>
                <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={chartData} margin={{ top: 5, right: 5, left: -20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fill: '#666', fontSize: 11 }}
                            axisLine={{ stroke: 'rgba(255,255,255,0.1)' }}
                            tickLine={false}
                        />
                        <YAxis
                            domain={[0.5, 3.5]}
                            ticks={[1, 2, 3]}
                            tickFormatter={(value) => value === 3 ? '😊' : value === 2 ? '😐' : '😔'}
                            tick={{ fontSize: 14 }}
                            axisLine={false}
                            tickLine={false}
                        />
                        <Tooltip
                            contentStyle={{
                                background: 'rgba(20, 20, 35, 0.95)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: 8,
                                color: 'white',
                            }}
                            formatter={(value: number) => [
                                value === 3 ? 'Good 😊' : value === 2 ? 'Neutral 😐' : 'Bad 😔',
                                'Mood'
                            ]}
                        />
                        <Line
                            type="monotone"
                            dataKey="value"
                            stroke="#8b5cf6"
                            strokeWidth={2}
                            dot={{ fill: '#8b5cf6', strokeWidth: 0, r: 4 }}
                            activeDot={{ r: 6, fill: '#a78bfa' }}
                            connectNulls={false}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 16, marginTop: 8 }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#666' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: moodColors.good }}></span>
                    Good
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#666' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: moodColors.neutral }}></span>
                    Neutral
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#666' }}>
                    <span style={{ width: 8, height: 8, borderRadius: '50%', background: moodColors.bad }}></span>
                    Bad
                </span>
            </div>
        </div>
    );
};
