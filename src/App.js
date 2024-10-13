import React, { useState, useRef, useEffect } from 'react';
import {
  Button,
  Container,
  Text,
  Title,
  Modal,
  TextInput,
  Group,
  Card,
  ActionIcon,
  Tooltip,
  MantineProvider,
  ColorSchemeProvider,
  useMantineTheme,
} from '@mantine/core';
import { MoonStars, Sun, Trash, Edit } from 'tabler-icons-react';
import { useColorScheme, useHotkeys, useLocalStorage } from '@mantine/hooks';


function TaskCard({ task, index, onEdit, onDelete }) {
  return (
    <Card withBorder mt="sm">
      <Group position="apart">
        <Text weight="bold">{task.title}</Text>
        <Group>
          <Tooltip
            label="Edit"
            position="top-end"
            withArrow
            transitionProps={{ transition: 'pop-bottom-right' }}
          >
            <ActionIcon onClick={() => onEdit(index)} color="blue" variant="transparent">
              <Edit />
            </ActionIcon>
          </Tooltip>
          <Tooltip
            label="Delete"
            position="top-end"
            withArrow
            transitionProps={{ transition: 'pop-bottom-right' }}
          >
            <ActionIcon onClick={() => onDelete(index)} color="red" variant="transparent">
              <Trash />
            </ActionIcon>
          </Tooltip>
        </Group>
      </Group>
      <Text color="dimmed" size="md" mt="sm">
        {task.summary || 'No summary was provided for this task'}
      </Text>
    </Card>
  );
}


function NewTaskModal({ opened, onClose, onCreate }) {
  const titleRef = useRef('');
  const summaryRef = useRef('');

  const handleCreate = () => {
    onCreate({
      title: titleRef.current.value,
      summary: summaryRef.current.value,
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="New Task" centered>
      <TextInput mt="md" ref={titleRef} placeholder="Task Title" required label="Title" />
      <TextInput mt="md" ref={summaryRef} placeholder="Task Summary" label="Summary" />
      <Group mt="md" position="apart">
        <Button onClick={onClose} variant="subtle">
          Cancel
        </Button>
        <Button onClick={handleCreate}>Create Task</Button>
      </Group>
    </Modal>
  );
}


function EditTaskModal({ opened, onClose, onSave, task }) {
  const [title, setTitle] = useState(task?.title || '');
  const [summary, setSummary] = useState(task?.summary || '');

  useEffect(() => {
    setTitle(task?.title || '');
    setSummary(task?.summary || '');
  }, [task]);

  const handleSave = () => {
    onSave({
      title,
      summary,
    });
    onClose();
  };

  return (
    <Modal opened={opened} onClose={onClose} title="Edit Task" centered>
      <TextInput
        mt="md"
        value={title}
        onChange={(e) => setTitle(e.currentTarget.value)}
        placeholder="Task Title"
        required
        label="Title"
      />
      <TextInput
        mt="md"
        value={summary}
        onChange={(e) => setSummary(e.currentTarget.value)}
        placeholder="Task Summary"
        label="Summary"
      />
      <Group mt="md" position="apart">
        <Button onClick={onClose} variant="subtle">
          Cancel
        </Button>
        <Button onClick={handleSave}>Save Changes</Button>
      </Group>
    </Modal>
  );
}


function DeleteConfirmationModal({ opened, onClose, onConfirm }) {
  return (
    <Modal opened={opened} onClose={onClose} title="Confirm Delete" centered>
      <Text>Are you sure you want to delete this task?</Text>
      <Group mt="md" position="apart">
        <Button onClick={onClose} variant="subtle">
          Cancel
        </Button>
        <Button color="red" onClick={onConfirm}>
          Delete
        </Button>
      </Group>
    </Modal>
  );
}


export default function App() {
  const [tasks, setTasks] = useState([]);
  const [newTaskModalOpen, setNewTaskModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [taskToEditIndex, setTaskToEditIndex] = useState(null);
  const [taskToDeleteIndex, setTaskToDeleteIndex] = useState(null);


  const preferredColorScheme = useColorScheme();
  const [colorScheme, setColorScheme] = useLocalStorage({
    key: 'mantine-color-scheme',
    defaultValue: preferredColorScheme,
    getInitialValueInEffect: true,
  });
  const toggleColorScheme = () => setColorScheme(colorScheme === 'dark' ? 'light' : 'dark');
  useHotkeys([['mod+J', () => toggleColorScheme()]]);


  useEffect(() => {
    const storedTasks = localStorage.getItem('tasks');
    if (storedTasks) setTasks(JSON.parse(storedTasks));
  }, []);

  
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

 
  const handleCreateTask = (task) => {
    setTasks([...tasks, task]);
  };

  
  const handleEditTask = (updatedTask) => {
    const updatedTasks = [...tasks];
    updatedTasks[taskToEditIndex] = updatedTask;
    setTasks(updatedTasks);
  };

  
  const handleDeleteTask = () => {
    const updatedTasks = tasks.filter((_, index) => index !== taskToDeleteIndex);
    setTasks(updatedTasks);
    setDeleteModalOpen(false);
  };


  const theme = useMantineTheme();

  return (
    <ColorSchemeProvider colorScheme={colorScheme} toggleColorScheme={toggleColorScheme}>
      <MantineProvider
        theme={{ colorScheme, defaultRadius: 'md' }}
        withGlobalStyles
        withNormalizeCSS
      >
        <Container size={550} my={40}>
          <Group position="apart">
            <Title
              sx={{
                fontFamily: `Greycliff CF, ${theme.fontFamily}`,
                fontWeight: 900,
              }}
            >
              My Tasks
            </Title>
            <ActionIcon color="blue" onClick={toggleColorScheme} size="lg">
              {colorScheme === 'dark' ? <Sun size={16} /> : <MoonStars size={16} />}
            </ActionIcon>
          </Group>

          {tasks.length > 0 ? (
            tasks.map((task, index) => (
              <TaskCard
                key={index}
                task={task}
                index={index}
                onEdit={(i) => {
                  setTaskToEditIndex(i);
                  setEditModalOpen(true);
                }}
                onDelete={(i) => {
                  setTaskToDeleteIndex(i);
                  setDeleteModalOpen(true);
                }}
              />
            ))
          ) : (
            <Text size="lg" mt="md" color="dimmed">
              You have no tasks
            </Text>
          )}

          <Button onClick={() => setNewTaskModalOpen(true)} fullWidth mt="md">
            New Task
          </Button>

     
          <NewTaskModal
            opened={newTaskModalOpen}
            onClose={() => setNewTaskModalOpen(false)}
            onCreate={handleCreateTask}
          />

          {editModalOpen && (
            <EditTaskModal
              opened={editModalOpen}
              onClose={() => setEditModalOpen(false)}
              onSave={handleEditTask}
              task={tasks[taskToEditIndex]}
            />
          )}

          <DeleteConfirmationModal
            opened={deleteModalOpen}
            onClose={() => setDeleteModalOpen(false)}
            onConfirm={handleDeleteTask}
          />
        </Container>
      </MantineProvider>
    </ColorSchemeProvider>
  );
}
