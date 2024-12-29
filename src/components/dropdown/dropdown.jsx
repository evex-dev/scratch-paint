import bindAll from 'lodash.bindall';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import React from 'react';
import styles from './dropdown.css';
import dropdownIcon from './dropdown-caret.svg';
import * as Popover from '@radix-ui/react-popover';

class Dropdown extends React.Component {
    constructor (props) {
        super(props);
        bindAll(this, [
            'handleClosePopover',
            'handleToggleOpenState',
            'isOpen'
        ]);
        this.state = {
            isOpen: false
        };
    }
    handleClosePopover () {
        this.setState({
            isOpen: false
        });
    }
    handleToggleOpenState () {
        const newState = !this.state.isOpen;
        this.setState({
            isOpen: newState
        });
        if (newState && this.props.onOpen) {
            this.props.onOpen();
        }
    }
    isOpen () {
        return this.state.isOpen;
    }
    render () {
        return (
            /*<Popover
                body={this.props.popoverContent}
                isOpen={this.state.isOpen}
                preferPlace="below"
                onOuterAction={this.props.onOuterAction ?
                    this.props.onOuterAction : this.handleClosePopover}
                {...this.props}
            >
                
            </Popover>*/
            <Popover.Root>
                <Popover.Trigger asChild>
                    <div role="button" aria-label="Update dimensions">
                        <div
                            className={classNames(styles.dropdown, this.props.className, {
                                [styles.modOpen]: this.state.isOpen,
                                [styles.modClosed]: !this.state.isOpen
                            })}
                            onClick={this.handleToggleOpenState}
                        >
                            {this.props.children}
                            <img
                                className={classNames(styles.dropdownIcon, {
                                    [styles.modCaretUp]: this.state.isOpen
                                })}
                                draggable={false}
                                src={dropdownIcon}
                            />
                        </div>
                    </div>
                </Popover.Trigger>
                <Popover.Portal>
                    <Popover.Content className="Popover-body Popover Popover-below " sideOffset={5}>
                        {this.props.popoverContent}
                    </Popover.Content>
                </Popover.Portal>
            </Popover.Root>
        );
    }
}

Dropdown.propTypes = {
    children: PropTypes.node.isRequired,
    className: PropTypes.string,
    onOpen: PropTypes.func,
    onOuterAction: PropTypes.func,
    popoverContent: PropTypes.node.isRequired
};

export default Dropdown;
