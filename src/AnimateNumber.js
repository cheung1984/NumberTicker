import React, { Component } from 'react';
import { Text } from 'react-native';

const HALF_RAD = Math.PI / 2;

export default class AnimateNumber extends Component {
    static defaultProps = {
        interval: 14,
        timing: 'linear',
        steps: 45,
        value: 0,
        formatter: (val) => val,
        onFinish: () => { }
    };

    constructor (props) {
        super(props);
        this.state = {
            value: 0,
            displayValue: 0
        };
        this.dirty = false;
        this.startFrom = 0;
        this.endWith = 0;
    }

    componentDidMount () {
        this.startFrom = this.state.value;
        this.endWith = this.props.value;
        this.dirty = true;
        setTimeout(
            () => {
                this.startAnimate();
            }
            , this.props.startAt != null ? this.props.startAt : 0);
    }

    componentWillUpdate (nextProps, nextState) {
        if (this.props.value !== nextProps.value) {
            this.startFrom = this.props.value;
            this.endWith = nextProps.value;
            this.dirty = true;
            this.startAnimate();
            return;
        }
        if (!this.dirty) {
            return;
        }
        if (this.direction === true) {
            if (parseFloat(this.state.value) <= parseFloat(this.props.value)) {
                this.startAnimate();
            }
        }
        else if (this.direction === false) {
            if (parseFloat(this.state.value) >= parseFloat(this.props.value)) {
                this.startAnimate();
            }
        }
    }

    static TimingFunctions = {
        linear: (interval, progress) => {
            return interval;
        },
        easeOut: (interval, progress) => {
            return interval * Math.sin(HALF_RAD * progress) * 5;
        },
        easeIn: (interval, progress) => {
            return interval * Math.sin((HALF_RAD - HALF_RAD * progress)) * 5;
        }
    };

    startAnimate () {
        let progress = this.getAnimationProgress();
        setTimeout(() => {
            let value = (this.endWith - this.startFrom) / this.props.steps;
            let sign = value >= 0 ? 1 : -1;
            if (this.props.countBy) {
                value = sign * Math.abs(this.props.countBy);
            }
            let total = parseFloat(this.state.value) + parseFloat(value);
            this.direction = (value > 0);
            if (((this.direction) ^ (total <= this.endWith)) === 1) {
                this.dirty = false;
                total = this.endWith;
                this.props.onFinish(total, this.props.formatter(total));
            }
            if (this.props.onProgress)
                this.props.onProgress(this.state.value, total);
            this.setState({
                value: total,
                displayValue: this.props.formatter(total)
            });
        }, this.getTimingFunction(this.props.interval, progress));
    }

    getAnimationProgress () {
        return (this.state.value - this.startFrom) / (this.endWith - this.startFrom);
    }

    getTimingFunction (interval, progress) {
        if (typeof this.props.timing === 'string') {
            let fn = AnimateNumber.TimingFunctions[this.props.timing];
            return fn(interval, progress);
        } else if (typeof this.props.timing === 'function')
            return this.props.timing(interval, progress);
        else
            return AnimateNumber.TimingFunctions['linear'](interval, progress);
    }

    render () {
        return (
            <Text {...this.props}>
                {this.state.displayValue}
            </Text>);
    }
}
