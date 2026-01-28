import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Frown, Meh, Smile, Heart, Star } from 'lucide-react';

interface MoodInputProps {
    onSave: (mood: number, note: string) => void;
}

export const MoodInput: React.FC<MoodInputProps> = ({ onSave }) => {
    const [selectedMood, setSelectedMood] = useState<number | null>(null);
    const [note, setNote] = useState('');

    const moods = [
        { value: 1, icon: Frown, label: 'Rough', gradient: 'from-red-500 to-rose-600' },
        { value: 2, icon: Meh, label: 'Down', gradient: 'from-orange-500 to-amber-600' },
        { value: 3, icon: Smile, label: 'Okay', gradient: 'from-yellow-500 to-amber-500' },
        { value: 4, icon: Heart, label: 'Good', gradient: 'from-green-500 to-emerald-600' },
        { value: 5, icon: Star, label: 'Amazing', gradient: 'from-indigo-500 to-purple-600' },
    ];

    const handleSave = () => {
        if (selectedMood) {
            onSave(selectedMood, note);
            setSelectedMood(null);
            setNote('');
        }
    };

    return (
        <Card className="p-6 sm:p-8">
            <h2 className="text-xl sm:text-2xl font-bold mb-6 text-center text-white">
                How are you feeling?
            </h2>

            {/* Mood Buttons - Horizontal on mobile, stays horizontal on desktop */}
            <div className="grid grid-cols-5 gap-2 sm:gap-3 mb-6">
                {moods.map((mood) => {
                    const Icon = mood.icon;
                    const isSelected = selectedMood === mood.value;

                    return (
                        <button
                            key={mood.value}
                            onClick={() => setSelectedMood(mood.value)}
                            className={`
                flex flex-col items-center gap-1.5 sm:gap-2 p-2 sm:p-3 rounded-xl transition-all duration-300
                ${isSelected
                                    ? `bg-gradient-to-br ${mood.gradient} shadow-lg scale-105`
                                    : 'bg-white/5 hover:bg-white/10 opacity-70 hover:opacity-100'
                                }
              `}
                        >
                            <div className={`p-2 sm:p-2.5 rounded-full ${isSelected ? 'bg-white/20' : 'bg-white/5'}`}>
                                <Icon size={20} className="text-white sm:w-6 sm:h-6" />
                            </div>
                            <span className="text-[10px] sm:text-xs font-medium text-white">{mood.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Note Input */}
            <textarea
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note about your day (optional)..."
                className="w-full p-3 sm:p-4 rounded-xl bg-white/5 border border-white/10 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 outline-none resize-none h-24 sm:h-28 text-sm sm:text-base text-white placeholder:text-gray-500 mb-4"
            />

            <Button
                className="w-full"
                size="md"
                disabled={!selectedMood}
                onClick={handleSave}
            >
                Log Mood
            </Button>
        </Card>
    );
};
