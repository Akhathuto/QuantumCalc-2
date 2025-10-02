import { useState, useMemo } from 'react';
import { create, all } from 'mathjs';
import Button from './common/Button';

const math = create(all);

const Statistics = () => {
    const [dataStr, setDataStr] = useState('1, 5, 2, 8, 7, 9, 12, 4, 5, 8');
    const [error, setError] = useState<string | null>(null);

    const stats = useMemo(() => {
        setError(null);
        if (dataStr.trim() === '') {
            return null;
        }

        try {
            const data = dataStr.split(/[\s,]+/).filter(Boolean).map(s => {
                const num = parseFloat(s);
                if (isNaN(num)) throw new Error(`'${s}' is not a valid number.`);
                return num;
            });
            
            if (data.length < 2) {
                 setError("Please enter at least two numbers to calculate statistics.");
                 return null;
            }

            return [
                { name: 'Count', value: data.length },
                { name: 'Sum', value: math.sum(data) },
                { name: 'Mean', value: math.mean(data) },
                { name: 'Median', value: math.median(data) },
                { name: 'Mode', value: math.mode(data).join(', ') },
                { name: 'Standard Deviation', value: math.std(data) },
                { name: 'Variance', value: math.variance(data) },
                { name: 'Minimum', value: math.min(data) },
                { name: 'Maximum', value: math.max(data) },
                { name: 'Range', value: math.max(data) - math.min(data) },
            ];

        } catch (e: any) {
            setError(e.message || "Invalid data format. Please use comma or space-separated numbers.");
            return null;
        }
    }, [dataStr]);

    const formatValue = (value: number | string) => {
        if (typeof value === 'number') {
            return parseFloat(value.toFixed(5)).toString();
        }
        return value;
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Statistics Calculator</h2>
            
            <div className="mb-4">
                <label htmlFor="data-input" className="block text-lg font-medium mb-2">
                    Enter your data (comma or space-separated)
                </label>
                <textarea
                    id="data-input"
                    value={dataStr}
                    onChange={e => setDataStr(e.target.value)}
                    rows={4}
                    className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono focus:ring-brand-primary focus:border-brand-primary"
                    placeholder="e.g., 1, 2, 3, 4, 5"
                />
            </div>

            {error && <div className="text-red-400 bg-red-900/50 p-3 rounded-md mb-4">{error}</div>}

            <div className="bg-brand-surface/50 p-6 rounded-lg">
                <h3 className="text-xl font-bold mb-4 text-brand-accent">Results</h3>
                {stats ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-8 gap-y-4">
                        {stats.map(stat => (
                            <div key={stat.name} className="flex justify-between border-b border-gray-700 py-1">
                                <span className="font-semibold text-brand-text-secondary">{stat.name}:</span>
                                <span className="font-mono font-bold">{formatValue(stat.value)}</span>
                            </div>
                        ))}
                    </div>
                ) : (
                     <p className="text-brand-text-secondary">Enter data to see statistical analysis.</p>
                )}
            </div>
        </div>
    );
};

export default Statistics;