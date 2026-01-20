import React, {useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Pressable,
  Modal,
} from 'react-native';
import MaterialIcons from 'react-native-vector-icons/MaterialIcons';
import dayjs from 'dayjs';
import {useNavigation, useRoute} from '@react-navigation/native';
import ReqHeader from '../../components/ReqHeader';

const MyTasks = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const [headerMenuVisible, setHeaderMenuVisible] = useState(false);
  const [customModal, setCustomModal] = useState(false);
  const [customSectionName, setCustomSectionName] = useState('');
  const [customSections, setCustomSections] = useState([]);
  const [sectionMenuVisible, setSectionMenuVisible] = useState(false);
  const [activeSectionId, setActiveSectionId] = useState(null);

  const Section = ({
    id,
    title,
    count,
    children,
    defaultOpen = false,
    onOpenMenu,
  }) => {
    const [open, setOpen] = useState(defaultOpen);

    return (
      <View style={styles.sectionWrapper}>
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() => setOpen(!open)}>
          <View style={styles.sectionLeft}>
            <MaterialIcons
              name={open ? 'arrow-drop-down' : 'arrow-right'}
              size={22}
              color="#555"
            />
            <Text style={styles.sectionTitle}>{title}</Text>
          </View>

          <View style={styles.sectionRight}>
            <Text style={styles.countText}>{count}</Text>

            {/* THREE DOTS */}
            <TouchableOpacity
              onPress={() => onOpenMenu(id)}
              hitSlop={{top: 10, bottom: 10, left: 10, right: 10}}>
              <MaterialIcons name="more-horiz" size={18} color="#777" />
            </TouchableOpacity>
          </View>
        </TouchableOpacity>

        {open && children}
      </View>
    );
  };

  const TaskItem = ({item}) => (
    <TouchableOpacity
      style={styles.taskItem}
      onPress={() => navigation.navigate('TaskDetail', {task: item})}>
      <MaterialIcons name="check-circle-outline" size={20} color="#777" />
      <View style={{flex: 1}}>
        <Text style={styles.taskTitle} numberOfLines={2}>
          {item.Summary}
        </Text>
        {item.C_Project_ID?.identifier && (
          <Text style={styles.projectText}>{item.C_Project_ID.identifier}</Text>
        )}
      </View>

      {item.DateCompletePlan && (
        <Text style={styles.dateText}>
          {dayjs(item.DateCompletePlan).format('DD MMM')}
        </Text>
      )}
    </TouchableOpacity>
  );

  const EmptyBlock = ({text}) => (
    <View style={styles.emptyBlock}>
      <Text style={styles.emptyText}>{text}</Text>
    </View>
  );

  const {
    recentlyAssigned = [],
    todayTasks = [],
    nextWeekTasks = [],
    laterTasks = [],
  } = route.params || {};

  return (
    <>
    <ReqHeader title={'My tasks'} />
      <View style={styles.container}>

        <ScrollView showsVerticalScrollIndicator={false}>
          {/* RECENTLY ASSIGNED */}

          <Section
            id="recent"
            title="Recently Assigned"
            count={recentlyAssigned.length}
            onOpenMenu={sectionId => {
              setActiveSectionId(sectionId);
              setSectionMenuVisible(true);
            }}>
            {recentlyAssigned.length === 0 ? (
              <EmptyBlock text="No recently assigned tasks" />
            ) : (
              recentlyAssigned.map(t => <TaskItem key={t.uid} item={t} />)
            )}
          </Section>

          {/* TODAY */}
          <Section
            id="today"
            title="Do today"
            count={todayTasks.length}
            onOpenMenu={sectionId => {
              setActiveSectionId(sectionId);
              setSectionMenuVisible(true);
            }}>
            {todayTasks.length === 0 ? (
              <EmptyBlock text="Nothing to do today 🎉" />
            ) : (
              todayTasks.map(t => <TaskItem key={t.uid} item={t} />)
            )}
          </Section>

          {/* NEXT WEEK */}
          <Section
            id="nextWeek"
            title="Do next week"
            count={nextWeekTasks.length}
            onOpenMenu={sectionId => {
              setActiveSectionId(sectionId);
              setSectionMenuVisible(true);
            }}>
            {nextWeekTasks.length === 0 ? (
              <EmptyBlock text="No tasks for next week" />
            ) : (
              nextWeekTasks.map(t => <TaskItem key={t.uid} item={t} />)
            )}
          </Section>

          {/* LATER */}
          <Section
            id="later"
            title="Do later"
            count={laterTasks.length}
            onOpenMenu={sectionId => {
              setActiveSectionId(sectionId);
              setSectionMenuVisible(true);
            }}>
            {laterTasks.length === 0 ? (
              <EmptyBlock text="No tasks planned later" />
            ) : (
              laterTasks.map(t => <TaskItem key={t.uid} item={t} />)
            )}
          </Section>
          {customSections.map(sec => (
            <Section
              key={sec.id}
              id={sec.id} // ⭐ REQUIRED
              title={sec.title}
              count={sec.tasks.length}
              defaultOpen={true}
              onOpenMenu={sectionId => {
                setActiveSectionId(sectionId);
                setSectionMenuVisible(true);
              }}>
              {sec.tasks.length === 0 ? (
                <EmptyBlock text="No tasks in this section" />
              ) : (
                sec.tasks.map(t => <TaskItem key={t.uid} item={t} />)
              )}
            </Section>
          ))}

          {/* ADD CUSTOM */}
          <TouchableOpacity
            style={styles.customSectionBtn}
            onPress={() => setCustomModal(true)}>
            <MaterialIcons name="add" size={18} color="#555" />
            <Text style={styles.customText}>Add a custom section</Text>
          </TouchableOpacity>
          <Modal
            visible={headerMenuVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setHeaderMenuVisible(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setHeaderMenuVisible(false)}>
              <Pressable style={styles.modalBox}>
                <View style={styles.dragIndicator} />

                {/* SEARCH */}
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setHeaderMenuVisible(false);
                    navigation.navigate('SearchTasks'); // ya jo screen ho
                  }}>
                  <MaterialIcons name="search" size={20} color="#555" />
                  <Text style={styles.modalText}>Search in my tasks</Text>
                </TouchableOpacity>

                {/* ADD SECTION */}
                <TouchableOpacity
                  style={styles.modalItem}
                  onPress={() => {
                    setHeaderMenuVisible(false);
                    setCustomModal(true); // 👈 tumhara existing add section modal
                  }}>
                  <MaterialIcons name="add" size={20} color="#555" />
                  <Text style={styles.modalText}>Add section</Text>
                </TouchableOpacity>
              </Pressable>
            </TouchableOpacity>
          </Modal>

          <Modal
            visible={customModal}
            transparent
            animationType="slide"
            onRequestClose={() => setCustomModal(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setCustomModal(false)}>
              <Pressable style={styles.modalBox}>
                {/* Drag Indicator */}
                <View style={styles.dragIndicator} />

                <Text style={styles.modalTitle}>Add custom section</Text>

                <TextInput
                  placeholder="Section name"
                  value={customSectionName}
                  onChangeText={setCustomSectionName}
                  style={styles.input}
                  placeholderTextColor="#999"
                />

                <View style={styles.modalActions}>
                  <TouchableOpacity
                    style={styles.cancelBtn}
                    onPress={() => {
                      setCustomModal(false);
                      setCustomSectionName('');
                    }}>
                    <Text style={styles.cancelText}>Cancel</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={[
                      styles.createBtn,
                      !customSectionName && {opacity: 0.5},
                    ]}
                    disabled={!customSectionName}
                    onPress={() => {
                      setCustomSections(prev => [
                        ...prev,
                        {
                          id: Date.now().toString(),
                          title: customSectionName,
                          tasks: [],
                        },
                      ]);
                      setCustomSectionName('');
                      setCustomModal(false);
                    }}>
                    <Text style={styles.createText}>Create</Text>
                  </TouchableOpacity>
                </View>
              </Pressable>
            </TouchableOpacity>
          </Modal>
          <Modal
            visible={sectionMenuVisible}
            transparent
            animationType="slide"
            onRequestClose={() => setSectionMenuVisible(false)}>
            <TouchableOpacity
              style={styles.modalOverlay}
              activeOpacity={1}
              onPress={() => setSectionMenuVisible(false)}>
              <Pressable style={styles.modalBox}>
                <View style={styles.dragIndicator} />

                {/* EDIT */}
                <TouchableOpacity style={styles.modalItem}>
                  <MaterialIcons name="edit" size={20} color="#555" />
                  <Text style={styles.modalText}>Edit section name</Text>
                </TouchableOpacity>

                {/* ADD ABOVE */}
                <TouchableOpacity style={styles.modalItem}>
                  <MaterialIcons
                    name="vertical-align-top"
                    size={20}
                    color="#555"
                  />
                  <Text style={styles.modalText}>Add section above</Text>
                </TouchableOpacity>

                {/* ADD BELOW */}
                <TouchableOpacity style={styles.modalItem}>
                  <MaterialIcons
                    name="vertical-align-bottom"
                    size={20}
                    color="#555"
                  />
                  <Text style={styles.modalText}>Add section below</Text>
                </TouchableOpacity>

                {/* DELETE */}
                <TouchableOpacity style={styles.modalItem}>
                  <MaterialIcons
                    name="delete-outline"
                    size={20}
                    color="#E74C3C"
                  />
                  <Text style={[styles.modalText, {color: '#E74C3C'}]}>
                    Delete section
                  </Text>
                </TouchableOpacity>
              </Pressable>
            </TouchableOpacity>
          </Modal>
        </ScrollView>
      </View>
    </>
  );
};

export default MyTasks;

/* ---------------- STYLES ---------------- */

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9F8F6',
    // paddingHorizontal: '5%',
    paddingTop: '10%',
  },

  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: '5%',
    marginBottom: 16,
  },

  heading: {
    fontSize: 22,
    fontFamily: 'K2D-Bold',
    color: '#000',
  },

  sectionWrapper: {
    backgroundColor: '#fff',
    // borderRadius: 14,
    paddingVertical: 8,
    paddingHorizontal: '5%',
    // marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E5E5E5',
  },

  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 6,
  },

  sectionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  sectionRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },

  sectionTitle: {
    fontSize: 17,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },

  countText: {
    fontSize: 14,
    color: '#777',
    fontFamily: 'K2D-Medium',
  },

  taskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingVertical: 10,
  },

  taskTitle: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },

  projectText: {
    fontSize: 12,
    color: '#777',
    marginTop: 2,
  },

  dateText: {
    fontSize: 12,
    color: '#777',
  },

  emptyBlock: {
    paddingVertical: 14,
    alignItems: 'center',
  },

  emptyText: {
    fontSize: 13,
    color: '#999',
    fontFamily: 'K2D-Medium',
  },

  customSectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 12,
    paddingVertical: '3%',
    left: '5%',
    marginTop: '5%',
    backgroundColor: '#fff',
    justifyContent: 'center',
    width: '90%',
  },

  customText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#555',
  },

  modalTitle: {
    fontSize: 17,
    fontFamily: 'K2D-Bold',
    color: '#000',
    paddingHorizontal: 20,
    marginBottom: 12,
  },

  input: {
    marginHorizontal: 20,
    borderWidth: 1,
    borderColor: '#E5E5E5',
    borderRadius: 10,
    padding: 12,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },

  modalActions: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 12,
    paddingHorizontal: 20,
    marginTop: 16,
  },

  cancelBtn: {
    paddingVertical: 10,
    paddingHorizontal: 14,
  },

  cancelText: {
    fontSize: 14,
    color: '#555',
    fontFamily: 'K2D-Medium',
  },

  createBtn: {
    paddingVertical: 10,
    paddingHorizontal: 18,
    backgroundColor: '#2F4FE3',
    borderRadius: 8,
  },

  createText: {
    color: '#fff',
    fontFamily: 'K2D-Medium',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.3)',
    justifyContent: 'flex-end', // 👈 bottom
  },
  modalBox: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 18,
    borderTopRightRadius: 18,
    width: '100%', // 👈 Asana style
    paddingVertical: 12,
    paddingBottom: 24,
  },
  modalItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    gap: 12,
  },

  modalText: {
    fontSize: 14,
    fontFamily: 'K2D-Medium',
    color: '#000',
  },
  dragIndicator: {
    width: 40,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#DDD',
    alignSelf: 'center',
    marginBottom: 10,
  },
});
