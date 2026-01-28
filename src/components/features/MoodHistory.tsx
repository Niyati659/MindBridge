import React from 'react';
import { Card } from '../common/Card';
import { Frown, Meh, Smile, Heart, Star, Clock } from 'lucide-react';

interface MoodLog {
    id: string;
    value: number;
    note: string;
    timestamp: string;
}

interface MoodHistoryProps {
    logs: MoodLog[];
}

export const MoodHistory: React.FC<MoodHistoryProps> = ({ logs }) => {
    const getMoodInfo = (value: number) => {
        switch (value) {
            case 1: return { icon: Frown, gradient: 'from-red-500 to-rose-600', label: 'Rough' };
            case 2: return { icon: Meh, gradient: 'from-orange-500 to-amber-600', label: 'Down' };
            case 3: return { icon: Smile, gradient: 'from-yellow-500 to-amber-500', label: 'Okay' };
            case 4: return { icon: Heart, gradient: 'from-green-500 to-emerald-600', label: 'Good' };
            case 5: return { icon: Star, gradient: 'from-indigo-500 to-purple-600', label: 'Amazing' };
            default: return { icon: Smile, gradient: 'from-gray-500 to-gray-600', label: 'Unknown' };
        }
    };

    if (logs.length === 0) {
        return (
            <div className="text-center text-gray-400 mt-10 py-8">
                <Clock size={40} className="mx-auto mb-3 opacity-40" />
                <p>No mood logs yet.</p>
                <p className="text-sm text-gray-500 mt-1">Start tracking your emotions today!</p>
            </div>
        );
    }

    return (
        <div className="mt-8 space-y-3">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 mb-4">
                <Clock size={18} className="text-indigo-400" />
                Recent Entries
            </h3>
            {logs.slice(0, 7).map((log) => {
                const moodInfo = getMoodInfo(log.value);
                const Icon = moodInfo.icon;

                return (
                    <Card key={log.id} className="flex items-start gap-3 p-4">
                        <div className={`p-2 rounded-lg bg-gradient-to-br ${moodInfo.gradient} shrink-0`}>
                            <Icon size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center mb-1">
                                <span className="text-sm font-medium text-indigo-400">
                                    {moodInfo.label}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(log.timestamp).toLocaleDateString()}
                                </span>
                            </div>
                            {log.note && (
                                <p className="text-sm text-gray-300 line-clamp-2">{log.note}</p>
                            )}
                        </div>
                    </Card>
                );
            })}
        </div>
    );
};
