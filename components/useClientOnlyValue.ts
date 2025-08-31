// 웹 SSR 대비: 클라이언트에서만 true가 되도록
import { useEffect, useState } from 'react';

export function useClientOnlyValue<T>(server: T, client: T) {
    const [value, setValue] = useState<T>(server);
    useEffect(() => setValue(client), []);
    return value;
}