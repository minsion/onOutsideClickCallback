//import styles from './Modal.module.scss';

import React from 'react'

import Dialog from '@material-ui/core/Dialog';
import DialogActions from '@material-ui/core/DialogActions';
import DialogContent from '@material-ui/core/DialogContent';
import DialogContentText from '@material-ui/core/DialogContentText';
import DialogTitle from '@material-ui/core/DialogTitle';

function Modal(props) {
  return (
    <Dialog
      open={props.open}
      onClose={props.handleCancel}
      className={"modalWindow " + props.className}
    >
      <DialogTitle id="alert-dialog-title">{props.title}</DialogTitle>
      <DialogContent>
        <>
          {props.message && <DialogContentText id="alert-dialog-description">{props.message}</DialogContentText>}
          {props.children && <div>{props.children}</div>}
        </>

      </DialogContent>
      <DialogActions>
      <button onClick={props.handleAccept} className="defaultButton primaryButton">{props.acceptText}</button>
        {props.modalType !== "info" &&
          <button onClick={props.handleCancel} className="defaultButton">{props.cancelText}</button>
        }
      </DialogActions>
    </Dialog>
  )
}

export default Modal