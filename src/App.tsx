import { getRoundedToPrecision } from '@writetome51/get-rounded-to-precision';
import React, { useState, FormEvent, ReactElement } from 'react';
import styled from 'styled-components';

interface ChartBarProps {
  color: string;
  left: number;
  width: number;
}

const Chart = styled.div`
  width: 100%;
`;
const ChartBar = styled.div<ChartBarProps>`
  align-items: center;
  background: ${ props => props.color };
  color: #fff;
  display: flex;
  justify-content: center;
  font-size: 0.8rem;
  left: ${ props => props.left }px;
  height: 2rem;
  position: absolute;
  text-align: center;
  top: 0;
  width: ${ props => props.width }px;
`;
const ChartBarContainer = styled.div`
  height: 2rem;
  position: relative;
  width: 1400px;
`;
const ChartItemContainer = styled.div`
  align-items: center;
  display: flex;
  padding: .25rem;
`;
const ChartLabel = styled.div`
  width: 25rem;
`;
const Container = styled.div`
  margin: 2rem auto;
  max-width: 1024px;
  width: 100%;
`;
const Label = styled.label`
  display: block;
  margin-bottom: 1.25rem;
`;
const Logs = styled.textarea`
  height: 20rem;
  margin-bottom: 2rem;
  width: 100%;
`;
const Info = styled.div`
  background: #FEFCBF;
  border: solid 1px #FAF089;
  color: B7791F;
  margin-bottom: 2rem;
  padding: 1rem 2rem;

  code {
    font-size: 0.9rem;
    color: #975A16;
  }
`;

interface Item {
  end: number;
  name: string;
  start: number;
}

interface ChartItemProps {
  duration: number;
  index: number;
  max: number;
  name: string;
  start: number;
}

function ChartItem({ duration, index, max, name, start }: ChartItemProps): ReactElement {
  const colors = ['#2F855A', '#B83280', '#C53030', '#2B6CB0', '#C05621', '#B7791F', '#2C7A7B', '#6B46C1'];
  const color = colors[index % colors.length];

  const maxWidth = 900;
  const left = (start / max) * maxWidth;
  const width = (duration / max) * maxWidth;

  return (
    <ChartItemContainer>
      <ChartLabel>{ name }, { getRoundedToPrecision(duration, 3) }s</ChartLabel>
      <ChartBarContainer>
        <ChartBar color={ color } left={ left } width={ width }></ChartBar>
      </ChartBarContainer>
    </ChartItemContainer>
  );
}

export default function App(): ReactElement {
  const [logs, setLogs] = useState('');

  const logHandler = (event: FormEvent<HTMLTextAreaElement>): void => {
    setLogs(event.currentTarget.value);
  };

  const lines = logs.split('\n').filter((line: string) => line.includes('STAGE START') || line.includes('STAGE END'));

  const itemMap = lines.reduce((carry: { [index: string]: Item }, line: string) => {
    const isStart = line.includes('STAGE START');
    const parts = line.split(':');
    const csv = parts[parts.length - 1];

    const [ name, timestamp ] = csv.split(',');

    if (!carry[name]) {
      carry[name] = { name, start: 0, end: 0 };
    }

    if (isStart) {
      carry[name].start = parseInt(timestamp, 10);
    } else {
      carry[name].end = parseInt(timestamp, 10);
    }

    return carry;
  }, {});

  let items = Object.keys(itemMap).map(key => {
    return itemMap[key];
  });

  const minTimestamp = items.length > 0 ? Math.min(...items.map(item => Math.min(item.start, item.end))) : 0;

  items = items.map(item => ({
    ...item,
    start: (item.start - minTimestamp) / 1000,
    end: (item.end - minTimestamp) / 1000
  })).sort((a, b) => a.start - b.start);

  const maxTimestamp = items.length > 0 ? Math.max(...items.map(item => Math.max(item.start, item.end))) : 0;

  const total = items.length > 0 ? items[items.length - 1].end - items[0].start : 0

  return (
    <Container>
      <Info>
        <p>
          - Change the branch of the Jenkins Shared Library to <code>stage-timings</code> or use the job <code>joyful-pony-w5-poopy-life</code>.
        </p>
        <p>
          - Run the job.
        </p>
        <p>
          - Copy the Plaintext logs into the box below.
        </p>
      </Info>
      <div>
        <Label>Logs</Label>
        <Logs defaultValue={ logs } onChange={ logHandler }></Logs>
      </div>
      <div>
        <Label>Timings - { getRoundedToPrecision(total, 3) }s</Label>
        <Chart>
          {
            items.map((item, index) => <ChartItem
              duration={ item.end - item.start }
              key={ item.name }
              index={ index }
              max={ maxTimestamp }
              name={ item.name }
              start={ item.start }
              />
            )
          }
        </Chart>
      </div>
    </Container>
  );
}
