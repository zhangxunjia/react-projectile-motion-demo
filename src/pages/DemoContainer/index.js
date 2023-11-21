import React, {useReducer} from 'react';
import Test from './components/demo1';
import Test2 from './components/demo2';
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
                    children: <Test />
                },
                {
                    label: `Demo 2`,
                    key: 2,
                    children: <Test2 />
                }
            ]}
        />
    )
}

export default DemoContainer;