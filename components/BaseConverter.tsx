import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

type Base = 'bin' | 'oct' | 'dec' | 'hex';

const baseDetails = {
  bin: { name: 'Binary', base: 2, pattern: /^[01]*$/ },
  oct: { name: 'Octal', base: 8, pattern: /^[0-7]*$/ },
  dec: { name: 'Decimal', base: 10, pattern: /^[0-9]*$/ },
  hex: { name: 'Hexadecimal', base: 16, pattern: /^[0-9a-fA-F]*$/ },
};

const BaseConverter = () => {
    const [values, setValues] = useState({ bin: '1010', oct: '12', dec: '10', hex: 'a' });
    const [error, setError] = useState<string | null>(null);

    const handleInputChange = useCallback((base: Base, value: string) => {
        setError(null);
        const details = baseDetails[base];

        if (value === '') {
            setValues({ bin: '', oct: '', dec: '', hex: '' });
            return;
        }

        if (!details.pattern.test(value)) {
            setError(`Invalid character for ${details.name} number.`);
            setValues(prev => ({...prev, [base]: value}));
            return;
        }

        try {
            let decimalBigInt: bigint;
            const lowerValue = value.toLowerCase();
            switch (base) {
                case 'bin': decimalBigInt = BigInt('0b' + lowerValue); break;
                case 'oct': decimalBigInt = BigInt('0o' + lowerValue); break;
                case 'hex': decimalBigInt = BigInt('0x' + lowerValue); break;
                default: decimalBigInt = BigInt(lowerValue); break;
            }

            const decimalValue = BigInt.asIntN(64, decimalBigInt);

            setValues({
                bin: decimalValue.toString(2),
                oct: decimalValue.toString(8),
                dec: decimalValue.toString(10),
                hex: decimalValue.toString(16),
            });
        } catch (e) {
             setError(`Could not parse number. It may be too large or invalid.`);
             setValues(prev => ({...prev, [base]: value}));
        }
    }, []);

    const InputField = ({ base }: { base: Base }) => {
        const details = baseDetails[base];
        return (
            <div>
                <label htmlFor={base} className="block text-sm font-medium text-brand-text-secondary mb-1">{details.name} (Base {details.base})</label>
                <input
                    type="text"
                    id={base}
                    value={values[base]}
                    onChange={(e) => handleInputChange(base, e.target.value)}
                    className="w-full bg-gray-900/70 border-gray-600 rounded-md p-3 font-mono text-lg focus:ring-brand-primary focus:border-brand-primary"
                />
            </div>
        );
    };

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Base Converter</h2>
            <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
                <InputField base="dec" />
                <InputField base="bin" />
                <InputField base="hex" />
                <InputField base="oct" />

                {error && (
                    <div className="flex items-center gap-2 text-red-400 p-3 bg-red-900/50 rounded-md">
                        <AlertTriangle size={20} />
                        <span>{error}</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default BaseConverter;