import React, { useEffect, useMemo, useReducer } from 'react'
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

    // tabs右侧按钮内容 如果为移动端则直接显示按钮，否则包裹一层popover
    const languageButton = useMemo(() => {
        // 是否为移动端
        const isMobile = /iPhone|iPad|iPod|Android|Windows Phone/i.test(navigator.userAgent);
        const content = (
            <Button type="primary" shape="circle" onClick={changeLanguage}>
                {language === 'en' ? 'EN' : '中'}
            </Button>
        )

        return isMobile
            ? content
            : (
                <Popover
                    content="简体中文 / English"
                >
                    {content}
                </Popover>
            )
    }, [language])

    return (
        <Tabs
            className="demo-container"
            activeKey={activeKey}
            onChange={(activeKey) => dispatch({ activeKey })}
            destroyInactiveTabPane
            tabBarExtraContent={{
                right: languageButton
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
