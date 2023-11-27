import React, { useEffect, useReducer } from 'react'
import Demo1 from './components/Demo1'
import Demo2 from './components/Demo2'
import { Button, Popover, Tabs } from 'antd'
import './index.scss'
import i18n from 'i18next';

const DemoContainer = () => {
    const [state, dispatch] = useReducer(
        (state, action) => ({ ...state, ...action }),
        {
            // 当前激活状态的tab
            activeKey: 1,
            // 当前语言
            language: 'en'
        }
    )

    const { activeKey, language } = state

    // 切换语言
    const changeLanguage = () => {
        dispatch({ language: language === 'en' ? 'zh' : 'en' })
    }

    useEffect(() => {
        i18n.changeLanguage(language)
    }, [language])

    return (
        <Tabs
            className="demo-container"
            activeKey={activeKey}
            onChange={(activeKey) => dispatch({ activeKey })}
            destroyInactiveTabPane
            tabBarExtraContent={{
                right: (
                    <Popover
                        content="简体中文 / English"
                    >
                        <Button type="primary" shape="circle" onClick={changeLanguage}>
                            {language === 'en' ? 'EN' : '中'}
                        </Button>
                    </Popover>
                )
            }}
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

export default DemoContainer
