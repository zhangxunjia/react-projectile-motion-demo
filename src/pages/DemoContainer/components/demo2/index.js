import React, {
    useEffect, useReducer, useRef, useState
} from 'react';
// import { ProjectileMotionStarter, ProjectileMotion } from 'src/components/ProjectileMotion';
import EndCom from './EndCom';
import StartCom from './StartCom';
import './index.scss';

const initialState = {
    // 重新加载按钮是否可见
    isRealoadVisible:false
}

const Test = () => {
    const [state, dispatch] = useReducer((state, action) => ({ ...state, ...action }), initialState);

    const {
        isRealoadVisible
    } = state

    const setIsRealoadVisible = (isRealoadVisible) => {
        dispatch({
            isRealoadVisible
        })
    }

    return (<div className="demo2">
        <StartCom
            isRealoadVisible={isRealoadVisible}
        />
        <EndCom
            isRealoadVisible={isRealoadVisible}
            setIsRealoadVisible={setIsRealoadVisible}
        />
    </div>)
};

export default Test;
