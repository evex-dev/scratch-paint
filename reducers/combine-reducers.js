import {combineReducers} from 'redux';
import intlReducer from './intl';
import {ScratchPaintReducer} from 'scratch-paint';

export default combineReducers({
    intl: intlReducer,
    scratchPaint: ScratchPaintReducer
});
