// 앱 진입점에서 네비게이션 주입
// - Provider(테마/Zustand Persist 등)와 함께 감싸기 권장

import React from 'react';
import RootNavigation from '@/app/navigation';


const App: React.FC = () => {
    return <RootNavigation />;
};


export default App;