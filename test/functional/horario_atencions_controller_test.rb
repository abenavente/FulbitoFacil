require 'test_helper'

class HorarioAtencionsControllerTest < ActionController::TestCase
  setup do
    @horario_atencion = horario_atencions(:one)
  end

  test "should get index" do
    get :index
    assert_response :success
    assert_not_nil assigns(:horario_atencions)
  end

  test "should get new" do
    get :new
    assert_response :success
  end

  test "should create horario_atencion" do
    assert_difference('HorarioAtencion.count') do
      post :create, horario_atencion: @horario_atencion.attributes
    end

    assert_redirected_to horario_atencion_path(assigns(:horario_atencion))
  end

  test "should show horario_atencion" do
    get :show, id: @horario_atencion
    assert_response :success
  end

  test "should get edit" do
    get :edit, id: @horario_atencion
    assert_response :success
  end

  test "should update horario_atencion" do
    put :update, id: @horario_atencion, horario_atencion: @horario_atencion.attributes
    assert_redirected_to horario_atencion_path(assigns(:horario_atencion))
  end

  test "should destroy horario_atencion" do
    assert_difference('HorarioAtencion.count', -1) do
      delete :destroy, id: @horario_atencion
    end

    assert_redirected_to horario_atencions_path
  end
end
