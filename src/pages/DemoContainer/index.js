import React, {useReducer} from 'react';
import Demo1 from './components/Demo1';
import Demo2 from './components/Demo2';
import { Tabs } from 'antd'
import './index.scss'

const DemoContainer = () => {
    const [state, dispatch] = useReducer((state, action) => ({ ...state, ...action }), {
        activeKey: 1
    });

    const {
        activeKey
    } =  state

    return (
        <Tabs
            className="demo-container"
            activeKey={activeKey}
            onChange={(activeKey) => dispatch({activeKey})}
            destroyInactiveTabPane
            items={[
                {
                    label: `Demo 1`,
                    key: 1,
                    children: <Demo1 />
                },
                {
                    label: `Demo 2`,
                    key: 2,
                    children: <Demo2 />
                }
            ]}
        />
    )
}

export default DemoContainer;