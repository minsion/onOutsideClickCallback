import React, { useState, useMemo, useEffect, useRef } from "react";
import Modal from '../Modal/index';
import './EnterpriseModel.css'
import Accordion from '@material-ui/core/Accordion';
import AccordionSummary from '@material-ui/core/AccordionSummary';
import AccordionDetails from '@material-ui/core/AccordionDetails';
import ChevronRight from '@material-ui/icons/ChevronRight';
import Button from "@material-ui/core/Button";


export const SuperAccordion = (props) => {
  const [expanded, setExpanded] = useState();
  const [weeklyOpen, setWeeklyOpen] = useState(false);

  const isClickTrigger = useMemo(() => props.trigger === 'showOnly', [props.trigger]);
  const useClickAway = (ref, onOutsideClickCallback) => {
    const handleClick = (e) => {
      if (ref.current && !ref.current.contains(e.target)) {
        onOutsideClickCallback(e);
      }
    };
    useEffect(() => {
      document.addEventListener('click', handleClick);
      return () => {
        document.removeEventListener('click', handleClick);
      };
    });
  };

  const ConditionalWrapper = ({ initialWrapper, condition, wrapper, children }) =>
    condition ? wrapper(children) : initialWrapper(children);

  const ClickAwayWrapper = ({ children, onClickAwayCallback, className }) => {
    const wrapperRef = useRef(null);
    useClickAway(wrapperRef, onClickAwayCallback);
    return (
      <div className={className} ref={wrapperRef}>
        {children}
      </div>
    );
  };
  const handleChange = (panel) => (event, newExpanded) => {
    setExpanded(newExpanded ? panel : false);
  };
  const handleOpen = () => {
    setWeeklyOpen(true);
  };
  const handleClose = () => {
    setWeeklyOpen(false);
  };
 const handleAccept = () => {
 }
  return (
    <ConditionalWrapper
      condition={isClickTrigger}
      initialWrapper={(children) => <>{children}</>}
      wrapper={(children) => (
        <ClickAwayWrapper onClickAwayCallback={() => setExpanded(false)}>{children}</ClickAwayWrapper>
      )}
    >
      <Accordion key={isClickTrigger} expanded={expanded === "panel" + props.id} onChange={ props.type === 'modal' ? handleOpen : handleChange("panel" + props.id)}>
        <AccordionSummary
          expandIcon={props.type ==='modal' ? <Button variant="contained" color="primary">weekly message</Button> : <ChevronRight />}
        >
          {props.label}
        </AccordionSummary>
        <AccordionDetails>
          {props.detail}
        </AccordionDetails>
      </Accordion>
      <Modal
        className="wrapper-enterprise-model"
        modalType="info"
        open={weeklyOpen}
        acceptText="View All Weekly Message"
        handleAccept={handleAccept}
        handleClose={handleClose}
      >
        <div>
          <div className="wrapper-head">
            <div className="title">The Enterprise Model - Weekly Message</div>
            <i className="fas fa-close" onClick={handleClose}></i>
          </div>
          <div className="sub-title">Enterprise Model - Purpose - Driven Leadership</div>
          <div className="content">
            I recently ran across an article excerpted from Leadership from the Inside Out: Becoming a Leader for Life by Kevin Cashman that discusses his 8 Principles of Purpose-Driven Leadership:
            1. Get in touch with what is important to you - "...pay attention to what energizes and excites you, what expands your boundaries and brings you happiness
            2. Act "on purpose" - "Committing yourself to pursing your purpose will marshal energies and potentialities within that you did not know you had
            3. Find team core purpose - "When a team's purpose supports the organization's mission and strategy, great things happen
            4. Do not mistake the path for the goal - "Always remind yourself that the program or practice, no matter how stimulating or fulfilling, is the methodology - not the goal
            5. Focus on service - "Purpose is not purposeful without serving others."
            6. Be purposeful in all domains - "...examine the degree to which you are being purposeful in all parts of your life
            7. Lear from "failure" - "[failure] is life attempting to teach us some new lessons or trying to point us toward some new directions
            8. Be flexible - "...[be] open to the process of expressing our internal sense of purpose in many different roles and life circumstances
            "Good leaders build products. Great leaders build cultures. Good leaders deliver results. Great leaders develop people. Good leaders have a vision. Great leaders have values. Good leaders are role models at work.
            Great leaders are role models in life."
            -Adam Gra
            If you have feedback you would like to share about this message, the Enterprise Model, or ideas for future messages, e-mail me at kataylor@eprod.co
            *In 2017, the Office of the Chairman published the Enterprise Model to communicate clearly to all employees the things that are important to making Enterprise a great company. The model includes our personal and collective mission statements, our values (what we believe), our environment (how we work) and our leadership focus (how we lead). Click here to review the Enterprise Mode
            On Wednesday of each week, I will highlight an aspect of the Enterprise Model to increase understanding and provide tips and guidance on how to make the concepts a part of our day to day work. Feel free to incorporate these messages in your team meetings and discussions with fellow emplovee
          </div>
          <div className="wrapper-btn">
            <Button variant="contained" color="primary">View All Weekly Message</Button>
          </div>
        </div>
      </Modal>
    </ConditionalWrapper>
  );
};
export default function EnterpriseModel() {
  const dataList = [
    {id: 1, label: 'Our Personal Mission', detail: 'Do the best we can ever day'},
    {id: 2, label: 'Our Collective Mission', detail: '222'},
    {id: 3, label: 'Our Values(what we belive)', detail: '333'},
    {id: 4, label: 'Our Envionment(How we work)', detail: '444'},
    {id: 5, label: 'Our Leadership Focus(how we lead)', detail: '555'},
    {id: 6, label: "This Week's Message (what we belive)", detail: "666", type: 'modal'}
  ]
  return (
    <div className="App">
      <div style={{ width: '50%', padding: "20px", backgroundColor: '#f2f2f2'}}>
        <h2>The Enterprise Model</h2>
        <div>
          {dataList.map((item, index) => {
            return(
              <SuperAccordion
                key={index}
                id={item.id}
                label={item.label}
                detail={item.detail}
                type={item.type}
                trigger="showOnly"
              />
            )
          })}
        </div>
      </div>
    </div>
  );
}
