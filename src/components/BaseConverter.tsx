import { useState, useCallback } from 'react';
import { AlertTriangle } from 'lucide-react';

type Base = 'bin' | 'oct' | 'dec' | 'hex';

const baseDetails = {
  bin: { name: 'Binary', base: 2, pattern: /^[01]*$/ },
  oct: { name: 'Octal', base: 8, pattern: /^[0-7]*$/ },
  dec: { name: 'Decimal', base: 10, pattern: /^[0-9]*$/ },
  hex: { name: 'Hexadecimal', base: 16, pattern: /^[0-9a-fA-F]*$/ },
};

interface InputFieldProps {
    base: Base;
    value: string;
    onChange: (base: Base, value: string) => void;
}

const InputField = ({ base, value, onChange }: InputFieldProps) => {
    const details = baseDetails[base];
    return (
        <div>
            <label htmlFor={base} className="block text-sm font-medium text-brand-text-secondary mb-1">{details.name} (Base {details.base})</label>
            <input
                type="text"
                id={base}
                value={value}
                onChange={(e) => onChange(base, e.target.value)}
                className="w-full bg-brand-bg/50 border border-brand-border/60 text-brand-text rounded-xl p-3 font-mono text-lg focus:ring-2 focus:ring-brand-primary outline-none transition-all"
            />
        </div>
    );
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
        } catch {
             setError(`Could not parse number. It may be too large or invalid.`);
             setValues(prev => ({...prev, [base]: value}));
        }
    }, []);

    return (
        <div>
            <h2 className="text-3xl font-bold mb-6 text-brand-primary">Base Converter</h2>
            <div className="bg-brand-surface/50 p-6 rounded-lg space-y-4">
                <InputField base="dec" value={values.dec} onChange={handleInputChange} />
                <InputField base="bin" value={values.bin} onChange={handleInputChange} />
                <InputField base="hex" value={values.hex} onChange={handleInputChange} />
                <InputField base="oct" value={values.oct} onChange={handleInputChange} />

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